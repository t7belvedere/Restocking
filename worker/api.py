"""FastAPI app — exposes /analyze so the frontend can delegate scraping to the worker."""

import json
import logging
import os
import random
import re
import time
from urllib.parse import urlparse

import httpx

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from scrapling.fetchers import Fetcher, PlayWrightFetcher
from starlette.responses import HTMLResponse, StreamingResponse

load_dotenv()

logger = logging.getLogger("restock.api")

app = FastAPI(title="Restock Worker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.restocking.app",
        "https://restocking.app",
        "http://localhost:3000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Helpers (mirror the frontend's analyzeUrl HTML parsing)
# ---------------------------------------------------------------------------

SIZE_TOKENS = [
    "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL",
    *[str(n) for n in range(34, 51)],
]


def _pick_meta(html: str, prop: str) -> str | None:
    # Match in either order: property-then-content or content-then-property
    for pat in (
        rf'<meta[^>]+(?:property|name)=["\']{prop}["\'][^>]+content=["\']([^"\']+)["\']',
        rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']{prop}["\']',
    ):
        m = re.search(pat, html, re.IGNORECASE)
        if m:
            return m.group(1)
    return None


def _pick_price(html: str) -> float | None:
    # 1. Meta tags — most reliable
    for key in ("og:price:amount", "product:price:amount", "price"):
        raw = _pick_meta(html, key)
        if raw:
            try:
                return float(raw.replace(",", "."))
            except (ValueError, TypeError):
                pass
    # 2. JSON-LD offers
    for m in re.finditer(
        r'<script type="application/ld\+json"[^>]*>(.*?)</script>',
        html,
        re.DOTALL,
    ):
        try:
            data = json.loads(m.group(1))
            if isinstance(data, dict) and data.get("@type") == "Product":
                offers = data.get("offers", [])
                if isinstance(offers, dict):
                    offers = [offers]
                for o in offers:
                    p = o.get("price")
                    if p is not None:
                        return float(p)
        except Exception:
            pass
    # 3. Regex fallback — first significant price (product comes before recommendations)
    for m in re.finditer(r"(\d{1,4}(?:[.,]\d{2})?)\s*€", html):
        try:
            price = float(m.group(1).replace(",", "."))
            if price > 1:  # skip shipping fees and trivial amounts
                return price
        except (ValueError, TypeError):
            pass
    return None


def _extract_variants(html: str) -> list[str]:
    """Extract size and color variants from HTML.

    Tries: data-size/data-color attrs, JSON-LD offers, text nodes near selectors.
    """
    found: set[str] = set()

    # 1. Explicit data-size attributes only — no free-text matching
    #    Single-letter tokens (S, M, L) are too ambiguous in raw HTML.
    for token in SIZE_TOKENS:
        if re.search(
            rf'data-(?:size|value)=["\']\s*{re.escape(token)}\s*["\']',
            html,
        ):
            found.add(token)

    # 2. JSON-LD Product offers (Zara, other retailers)
    for m in re.finditer(
        r'<script type="application/ld\+json"[^>]*>(.*?)</script>',
        html,
        re.DOTALL,
    ):
        try:
            data = json.loads(m.group(1))
            if isinstance(data, dict) and data.get("@type") == "Product":
                offers = data.get("offers", [])
                if isinstance(offers, dict):
                    offers = [offers]
                for o in offers:
                    for key in ("size", "color", "name"):
                        v = o.get(key, "").strip()
                        if v:
                            found.add(v)
        except Exception:
            pass

    # 2b. Structured data: \"size\":\"TOKEN\" or \"color\":\"TOKEN\" in JSON or HTML
    for token in SIZE_TOKENS:
        if re.search(rf'"(?:size|color|name)"\s*:\s*"{re.escape(token)}"', html):
            found.add(token)

    # 2c. Shopify productVariants JSON (APC, other Shopify stores)
    m = re.search(r'"productVariants"\s*:\s*\[(.*?)\]', html)
    if m:
        try:
            variants_data = json.loads("[" + m.group(1) + "]")
            for v in variants_data:
                if isinstance(v, dict):
                    title = v.get("title", "").strip()
                    if title:
                        found.add(title)
        except Exception:
            pass

    # 2d. Magento configurable product options (Subdued, other Magento stores)
    #      Pattern: "label":"Taille","options":[{"label":"34",...}]
    for size_key in ("Taille", "Taglia", "Size", "Größe", "Talla"):
        found.update(_extract_magento_options(html, size_key))
    for color_key in ("Couleur", "Colore", "Color", "Colour", "Farbe"):
        found.update(_extract_magento_options(html, color_key))

    # 3. data-color attributes
    for m in re.finditer(r'data-color=["\']([^"\']{1,32})["\']', html, re.IGNORECASE):
        val = m.group(1).strip()
        # Skip hex codes and pure numeric RGB values
        if re.match(r"^#[0-9a-fA-F]{3,8}$", val):
            continue
        if re.fullmatch(r"[\d\s,]+", val):
            continue
        found.add(val)
        if len(found) > 24:
            break

    # 4. alt text on color swatch images (Pimkie, other Shopify themes)
    #    e.g. <img alt="blanc"> inside a color selector
    _CSS_VALUES = {"auto", "none", "inherit", "initial", "unset", "currentcolor",
                   "transparent", "rgb", "rgba", "hsl", "hsla", "black", "white",
                   "gray", "grey", "silver", "solid", "dashed", "dotted"}
    _ALT_SKIP = {"photo", "image", "produit", "product", "logo", "paiement",
                 "carte", "paypal", "visa", "mastercard", "livraison", "retour",
                 "javel", "blanchiment", "recyclage", "certifié", "qualité",
                 "nettoyage", "repassage", "séchage", "lavage", "blanchiment",
                 "interdit", "séchage", "javel",
                 # Payment / trust / ui
                 "american express", "apple pay", "klarna", "alma", "oney",
                 "trustpilot", "france", "fr", "en", "de", "es", "it",
                 # Navigation
                 "accueil", "home", "boutique", "shop", "magasin", "store",
                 "compte", "account", "connexion", "login", "panier", "cart",
                 "recherche", "search", "menu", "fermer", "close",
                 # Badges / flags
                 "drapeau", "flag", "paiement", "payment", "livraison", "delivery",
                 "réduction", "discount", "solde", "sale", "nouveau", "new",
                 "promo", "promotion", "cadeau", "gift",
                 # Carousel / gallery navigation
                 "next", "previous", "suivant", "précédent", "precedent"}
    for m in re.finditer(
        r'<img[^>]+alt=["\']([^"\']{1,30})["\'][^>]*>',
        html, re.IGNORECASE,
    ):
        alt = m.group(1).strip()
        if not alt or len(alt) > 25:
            continue
        low = alt.lower()
        if low in _CSS_VALUES:
            continue
        # Skip hex codes and pure numeric RGB sequences
        if re.match(r"^#[0-9a-fA-F]{3,8}$", alt):
            continue
        if re.fullmatch(r"[\d\s,]+", alt):
            continue
        # Skip long alt texts (product names, not color swatches)
        if len(alt.split()) > 3:
            continue
        # Skip SVG/UI icon alt texts
        if any(w in low for w in ("icon", "minus", "plus", "transparent", "sound", "loading", "spinner")):
            continue
        if any(w in low for w in _ALT_SKIP):
            continue
        found.add(alt)

    # 5. "Couleur : X" / "Color : X" text nodes (Pimkie, general)
    _CSS_JUNK = {"auto", "none", "inherit", "initial", "unset", "currentcolor",
                 "transparent", "rgb", "rgba", "hsl", "hsla", "var", "black", "white",
                 "gray", "grey", "silver", "red", "blue", "green", "yellow", "orange"}
    for m in re.finditer(
        r'(?:Couleur|Colour|Color|Colore|Farbe)\s*:\s*(\w[\w\s\-]{0,25})',
        html, re.IGNORECASE,
    ):
        val = m.group(1).strip()
        low = val.lower()
        if not val or len(val) > 25 or low in _CSS_JUNK:
            continue
        # Skip CSS variable values: "--text-color: 28 28 28" etc.
        # Look back 80 chars for CSS-like context without an HTML tag boundary
        pre = html[max(0, m.start() - 80):m.start()]
        if re.search(r'(?:--|[{};])\s*$', pre) and ">" not in pre.rsplit("<", 1)[-1]:
            continue
        # Skip if we're inside a <style> tag (CSS, not HTML content)
        before = html[max(0, m.start() - 4000):m.start()]
        if before.rfind("<style") > before.rfind("</style>"):
            continue
        found.add(val)

    return list(found)[:24]


def _extract_title(html: str) -> str | None:
    """Extract product name from <title>, stripping site suffix."""
    m = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE)
    if not m:
        return None
    title = m.group(1).strip()
    # Strip common site suffixes
    for sep in ("|", "–", "—", "-"):
        if sep in title:
            parts = title.rsplit(sep, 1)
            if len(parts[1].strip().split()) <= 4:
                title = parts[0].strip()
                break
    return title or None


# ---------------------------------------------------------------------------
# LLM-based universal extraction (DeepSeek)
# ---------------------------------------------------------------------------

_DEEPSEEK_KEY = os.getenv("DEEPSEEK_API_KEY")
_DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions"

_LLM_PROMPT = """Extract product details from this product page. Return ONLY valid JSON, no explanation.

{
  "name": "product name (string or null)",
  "price": 29.95,
  "image_url": "full image URL (string or null)",
  "sizes": ["XS", "S", "M"],
  "colors": ["Bleu", "Rouge"]
}

Rules:
- name: the product title. Prefer og:title meta > JSON-LD name > h1.
- price: numeric only (no currency symbol). IMPORTANT: use the actual selling price from JSON-LD "price" field or og:price:amount meta. Ignore sale/discounted labels.
- image_url: the FULL URL of the main product image from og:image or JSON-LD
- sizes: ALL available sizes (XS, S, M, L, XL, 36, 38, 40, etc). Look in JSON-LD offers array, select options, and aria-labels. Return [] if none found.
- colors: ALL available colors, not just the selected one. Look for aria-labels on color buttons, JSON-LD offers with different colors, color swatches. Return [] if none found.
- Be thorough — extract ALL variants, not just the first one."""


def _prepare_html_for_llm(html: str, page, url: str) -> str:
    """Strip HTML down to extraction-relevant parts to minimize LLM tokens."""
    parts: list[str] = []
    parts.append(f"URL: {url}")

    # <title>
    m = re.search(r"<title[^>]*>([^<]+)</title>", html, re.I)
    if m:
        parts.append(f"Title: {m.group(1).strip()}")

    # Meta tags
    metas: list[str] = []
    for m in re.finditer(
        r'<meta[^>]+(?:property|name)=["\']([^"\']+)["\'][^>]+content=["\']([^"\']+)["\']',
        html, re.I,
    ):
        key, val = m.group(1), m.group(2)
        if any(p in key.lower() for p in ("og:", "product:", "twitter:", "description", "price", "title")):
            metas.append(f"  {key}: {val}")
    if metas:
        parts.append("Meta:\n" + "\n".join(metas))

    # JSON-LD (all blocks — products, itemList, etc.)
    jsonld_blocks: list[str] = []
    for m in re.finditer(
        r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>',
        html, re.DOTALL,
    ):
        try:
            data = json.loads(m.group(1))
            jsonld_blocks.append(json.dumps(data, ensure_ascii=False)[:4000])
        except Exception:
            pass
    if jsonld_blocks:
        parts.append("JSON-LD:\n" + "\n---\n".join(jsonld_blocks))

    # Microdata (itemprop/product) — schema.org attributes in HTML
    microdata: list[str] = []
    for m in re.finditer(
        r'<[^>]+itemprop=["\']([^"\']+)["\'][^>]*>(?:<[^>]+>)*([^<]{1,200})',
        html, re.I,
    ):
        prop, val = m.group(1), m.group(2).strip()
        if val and prop in ("name", "price", "color", "size", "sku", "productID", "image"):
            microdata.append(f"  {prop}: {val}")
    if microdata:
        parts.append("Microdata:\n" + "\n".join(microdata[:30]))

    # Select dropdowns
    if page is not None:
        try:
            for sel in page.css("select"):
                name = sel.attrib.get("name", "") or sel.attrib.get("aria-label", "") or sel.attrib.get("id", "")
                opts: list[str] = []
                for opt in sel.css("option"):
                    txt = (opt.get_all_text() or "").strip()
                    if txt and txt not in ("--", "-", "Select", "Choisir", "Sélectionner", "Please select", "Select size", "Select color"):
                        opts.append(txt)
                if opts:
                    parts.append(f"Select '{name}': {', '.join(opts)}")
        except Exception:
            pass

    # data-color attributes (color swatches — Shopify, Stüssy, etc.)
    data_colors: set[str] = set()
    for m in re.finditer(r'data-color=["\']([^"\']{1,40})["\']', html, re.I):
        data_colors.add(m.group(1).strip())
    if data_colors:
        parts.append(f"Available colors (data-color): {', '.join(sorted(data_colors))}")

    # data-size attributes
    data_sizes: set[str] = set()
    for m in re.finditer(r'data-size=["\']([^"\']{1,20})["\']', html, re.I):
        data_sizes.add(m.group(1).strip())
    if data_sizes:
        parts.append(f"Available sizes (data-size): {', '.join(sorted(data_sizes))}")

    # Aria-labels on ALL interactive elements (buttons, links, options)
    if page is not None:
        try:
            color_candidates: set[str] = set()
            size_candidates: set[str] = set()
            other_labels: set[str] = set()
            for sel in (
                "button[aria-label]",
                "a[aria-label]",
                "li[aria-label]",
                "option[aria-label]",
                "[class*=product] [aria-label]",
                "[class*=selector] [aria-label]",
                "[class*=color] [aria-label]",
                "[class*=size] [aria-label]",
                "[class*=swatch] [aria-label]",
            ):
                for el in page.css(sel):
                    label = (el.attrib.get("aria-label") or "").strip()
                    if not label or len(label) > 40:
                        continue
                    # Heuristic: if it looks like a color word, put in color_candidates
                    if re.search(r"(?:Bleu|Blanc|Noir|Rouge|Jaune|Vert|Rose|Gris|Brun|Orange|Violet|Marron|Beige|Ivoire|Kaki|Argent|Doré|Turquoise|Bordeaux|Lavande|White|Black|Red|Blue|Green|Pink|Grey|Brown|Purple|Silver|Gold|Navy|Cream)", label, re.I):
                        color_candidates.add(label)
                    elif label.upper() in SIZE_TOKENS or re.match(r"^\d{1,2}$", label):
                        size_candidates.add(label)
                    else:
                        other_labels.add(label)

            if color_candidates:
                parts.append(f"Color labels found: {', '.join(sorted(color_candidates))}")
            if size_candidates:
                parts.append(f"Size labels found: {', '.join(sorted(size_candidates))}")
            if other_labels and len(other_labels) <= 20:
                parts.append(f"Other aria-labels: {', '.join(sorted(other_labels))}")
        except Exception:
            pass

    # data-value / value attributes on buttons/options (variant selectors)
    if page is not None:
        try:
            data_values: set[str] = set()
            for sel in ("button[data-value]", "option[value]", "li[data-value]", "[data-index]"):
                for el in page.css(sel):
                    for attr in ("data-value", "value", "data-size"):
                        val = el.attrib.get(attr, "").strip()
                        if val and len(val) <= 30 and val not in ("", "--", "default"):
                            data_values.add(val)
            if data_values:
                parts.append(f"Variant values: {', '.join(sorted(data_values)[:30])}")
        except Exception:
            pass

    # Visible text from product-related sections
    if page is not None:
        try:
            body_texts: list[str] = []
            for sel in (
                "[class*=product-detail]",
                "[class*=product-info]",
                "[class*=pdp]",
                "main",
                "[id*=product]",
                "[class*=product]",
            ):
                els = page.css(sel)
                for el in els[:2]:
                    txt = el.get_all_text()
                    if isinstance(txt, str) and len(txt) > 50:
                        # Clean: collapse whitespace, remove excessive blank lines
                        cleaned = re.sub(r"\n\s*\n", "\n", txt)
                        body_texts.append(cleaned[:2500])
                        break
                if body_texts:
                    break
            if body_texts:
                parts.append(f"Body text: {body_texts[0]}")
        except Exception:
            pass

    # Embedded variant JSON in script tags (ASOS, Boohoo, many others).
    # Find script blocks that contain size/variant/colour arrays or objects.
    variant_scripts: list[str] = []
    for m in re.finditer(
        r'<script[^>]*>(.*?)</script>',
        html, re.DOTALL,
    ):
        content = m.group(1)
        # Skip tiny scripts, JSON-LD (already extracted), and analytics
        if len(content) < 200 or '"@context"' in content:
            continue
        # Look for variant/size/color data patterns
        has_size = bool(re.search(r'"size"\s*:\s*"([A-Z0-9]{1,6})"', content))
        has_color = bool(re.search(r'"(?:color|colour|colorName|colourName)"\s*:\s*"([^"]+)"', content))
        has_variants = bool(re.search(r'"(?:variants|sizes|productVariants|variantSkus)"\s*:\s*\[', content))
        if has_size or has_color or has_variants:
            # Extract just the relevant JSON portions
            # Find "variants" arrays
            for vm in re.finditer(
                r'"(?:variants|sizes|productVariants|variantSkus)"\s*:\s*(\[.*?\](?=\s*[,}]))',
                content, re.DOTALL,
            ):
                variant_scripts.append(vm.group(0)[:3000])
            # Find size/color key-value pairs with context
            size_matches = re.findall(r'"size"\s*:\s*"[^"]{1,12}"', content)
            color_matches = re.findall(r'"(?:color|colour|colorName|colourName)"\s*:\s*"[^"]{1,40}"', content)
            if size_matches or color_matches:
                variant_scripts.append(
                    "Variants: " + ", ".join((size_matches + color_matches)[:40])
                )
    if variant_scripts:
        parts.append("Variant data:\n" + "\n".join(variant_scripts[:10]))

    return "\n\n".join(parts)


async def _llm_extract(html: str, page, url: str) -> dict | None:
    """Use DeepSeek to extract product metadata from a cleaned HTML representation.

    Returns None if LLM is not configured or fails.
    """
    if not _DEEPSEEK_KEY:
        return None

    cleaned = _prepare_html_for_llm(html, page, url)
    logger.debug("LLM input size: %d chars", len(cleaned))

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                _DEEPSEEK_URL,
                headers={
                    "Authorization": f"Bearer {_DEEPSEEK_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": _LLM_PROMPT},
                        {"role": "user", "content": cleaned},
                    ],
                    "temperature": 0,
                    "max_tokens": 500,
                },
            )
            if resp.status_code != 200:
                logger.warning("DeepSeek API error: %s — %s", resp.status_code, resp.text[:200])
                return None

            data = resp.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            # Extract JSON from the response (it might have markdown fences)
            json_match = re.search(r"\{.*\}", content, re.DOTALL)
            if not json_match:
                return None
            result = json.loads(json_match.group(0))
            logger.info("LLM extracted: name=%s price=%s sizes=%s colors=%s",
                        result.get("name"), result.get("price"),
                        result.get("sizes"), result.get("colors"))
            return result
    except Exception:
        logger.debug("LLM extraction failed", exc_info=True)
        return None


async def _download_image_base64(image_url: str, page_url: str) -> str | None:
    """Download an image and return it as a base64-encoded string.

    Uses browser-like headers including a Referer from the product page.
    Many CDNs (Inditex brands, Stüssy) block image requests that lack
    proper browser context, but will serve images when the request looks
    like it comes from a real page load.
    """
    import base64
    from urllib.parse import urlparse as _urlparse

    try:
        parsed = _urlparse(page_url)
        referer = f"{parsed.scheme}://{parsed.hostname}/"
    except Exception:
        referer = None

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    }
    if referer:
        headers["Referer"] = referer

    try:
        async with httpx.AsyncClient(timeout=12) as client:
            resp = await client.get(image_url, headers=headers)
            if resp.status_code == 200 and len(resp.content) > 100:
                b64 = base64.b64encode(resp.content).decode("ascii")
                logger.debug("Downloaded image: %d bytes → %d chars base64", len(resp.content), len(b64))
                return b64
    except Exception:
        logger.debug("Image download failed", exc_info=True)
    return None


def _detect_oos_variants(
    page, variants: list[str], sizes: list[str] | None = None, colors: list[str] | None = None
) -> tuple[set[str], dict[str, bool]]:
    """Return OOS variants + per-combination status.

    Returns:
        oos: set of variant strings that are out of stock
        combinations: dict like {"S / Noir": True, "XXL / Noir": False, ...}
    """
    if page is None or not variants:
        return set(), {}

    oos: set[str] = set()
    oos_sizes: set[str] = set()  # sizes that are OOS for the current color
    current_color: str | None = None
    combinations: dict[str, bool] = {}

    _OOS_CLASSES = {"opacity-20", "pointer-events-none", "sold-out", "out-of-stock",
                    "unavailable", "disabled", "line-through"}
    _OOS_WORDS = {"épuisé", "epuise", "sold out", "out of stock", "rupture",
                  "indisponible", "unavailable", "épuisée"}

    _sizes = sizes or []
    _colors = colors or []

    try:
        # Try to find the currently selected color from aria or data attrs
        for sel in ("[aria-current]", "[aria-selected=true]", "[class*=selected]", "[class*=active]"):
            els = page.css(sel)
            for el in els[:3]:
                aria = (el.attrib.get("aria-label") or "").strip()
                text = (el.get_all_text() or "").strip() if hasattr(el, "get_all_text") else ""
                for c in _colors:
                    if c.lower() in (aria + " " + text).lower():
                        current_color = c
                        break
                if current_color:
                    break
            if current_color:
                break

        # Scan size/color buttons and labels
        for sel in ("label", "button", "[class*=size]", "[class*=swatch]",
                     "[class*=variant]", "[class*=selector] button"):
            for el in page.css(sel):
                txt = (el.get_all_text() or "").strip().lower() if hasattr(el, "get_all_text") else ""
                cls = (el.attrib.get("class") or "").lower()
                disabled = el.attrib.get("disabled")
                aria_disabled = el.attrib.get("aria-disabled", "")
                aria_label = (el.attrib.get("aria-label") or "").lower()
                data_available = (el.attrib.get("data-availability-site") or
                                  el.attrib.get("data-available") or "").lower()

                # Check if this element is marked OOS
                is_oos = (
                    disabled is not None or
                    aria_disabled == "true" or
                    data_available == "false" or
                    any(w in cls for w in _OOS_CLASSES) or
                    any(w in txt for w in _OOS_WORDS) or
                    any(w in aria_label for w in _OOS_WORDS)
                )

                # Find which variant this element corresponds to
                search_text = f"{txt} {aria_label}"
                for v in variants:
                    v_lower = v.lower()
                    if len(v) == 1:
                        match = re.search(rf"\b{re.escape(v_lower)}\b", search_text)
                    else:
                        match = v_lower in search_text
                    if match:
                        if is_oos:
                            oos.add(v)
                            if v in _sizes:
                                oos_sizes.add(v)
                        break

        # Build per-combination status when we have color context
        if current_color and _sizes and _colors:
            for s in _sizes:
                for c in _colors:
                    key = f"{s} / {c}"
                    if c == current_color:
                        # For the visible color, we have per-size OOS data
                        combinations[key] = s not in oos_sizes
                    else:
                        # Unknown for other colors (page only shows one color at a time)
                        combinations[key] = True  # assume available

    except Exception:
        pass

    return oos, combinations


async def _universal_extract(page, html: str, url: str) -> dict:
    """Extract product metadata from a rendered page + raw HTML.

    Uses rendered DOM (Playwright) when available, falls back to
    regex on raw HTML. Works across all retailers without per-site code.
    """
    result: dict = {
        "name": None,
        "image_url": None,
        "image_base64": None,
        "price": None,
        "variants": [],
        "sizes": [],
        "colors": [],
        "sizes_status": {},  # { "XS": true, "XL": false, ... }
        "colors_status": {},  # { "blanc": true, "marron": true, ... }
    }

    # --- NAME ---
    # Priority: og:title meta > h1 > JSON-LD name > <title> tag
    name = _pick_meta(html, "og:title")
    if not name:
        name = _extract_css_text(page, "h1")
    if not name:
        name = _extract_jsonld_field(html, "name")
    if not name:
        name = _extract_title(html)
    result["name"] = name

    # --- PRICE ---
    # Priority: og:price meta > JSON-LD > CSS € symbols
    price = _pick_price(html)
    if price is None:
        price = _extract_css_price(page)
    result["price"] = price

    # --- IMAGE ---
    # Priority: og:image meta (always the product image) > DOM <img>
    # DOM images often include thumbnails, related products, and cross-sells.
    image_url = _pick_meta(html, "og:image")
    if not image_url:
        image_url = _extract_css_image(page, url)
    if image_url and image_url.startswith("http://"):
        image_url = image_url.replace("http://", "https://", 1)
    # Fix double-URL bug in source HTML (e.g. Na-KD og:image has doubled domain)
    if image_url:
        second_http = image_url.find("http", 8)
        if second_http > 0:
            image_url = image_url[second_http:]
    result["image_url"] = image_url

    # Download the product image as base64.
    # If og:image download fails, try DOM images as fallback.
    if image_url:
        b64 = await _download_image_base64(image_url, url)
        if not b64:
            fallback_img = _extract_css_image(page, url)
            if fallback_img and fallback_img != image_url:
                if fallback_img.startswith("http://"):
                    fallback_img = fallback_img.replace("http://", "https://", 1)
                b64 = await _download_image_base64(fallback_img, url)
                if b64:
                    result["image_url"] = fallback_img
        result["image_base64"] = b64

    # --- VARIANTS (sizes + colors unified) ---
    variants = _extract_variants(html)
    if page is not None:
        css_sizes = _extract_css_sizes(page)
        for s in css_sizes:
            if s not in variants:
                variants.append(s)
        css_colors = _extract_css_colors(page)
        for c in css_colors:
            if c not in variants:
                variants.append(c)
        # Also try <select> dropdowns and radio groups for any retailer
        dom_variants = _extract_dom_variants(page)
        for v in dom_variants:
            if v not in variants:
                variants.append(v)
        # Shopify: extract colors from option labels (client-side rendered)
        if _is_shopify(url, html):
            shopify_colors = _extract_shopify_colors(page, html)
            for c in shopify_colors:
                if c not in variants:
                    variants.append(c)

    sizes, colors = _classify_variants(variants)
    result["variants"] = variants
    result["sizes"] = sizes
    result["colors"] = colors

    # Detect which sizes/colors are out of stock (per combination when possible)
    oos, combinations = _detect_oos_variants(page, variants, sizes, colors)
    for s in sizes:
        result["sizes_status"][s] = s not in oos
    for c in colors:
        result["colors_status"][c] = c not in oos
    result["variants_status"] = combinations

    return result


def _extract_jsonld_field(html: str, field: str) -> str | None:
    """Extract a field from JSON-LD Product structured data."""
    for m in re.finditer(
        r'<script type="application/ld\+json"[^>]*>(.*?)</script>',
        html, re.DOTALL,
    ):
        try:
            data = json.loads(m.group(1))
            if isinstance(data, dict) and data.get("@type") == "Product":
                val = data.get(field)
                if isinstance(val, str) and val.strip():
                    return val.strip()
        except Exception:
            pass
    return None


def _extract_magento_options(html: str, label: str) -> list[str]:
    """Extract options from Magento configurable product JSON.

    Pattern: {"label":"Taille","options":[{"label":"34",...}]}
    Uses bracket counting to handle nested arrays/objects.
    """
    found: list[str] = []
    m = re.search(
        rf'"label"\s*:\s*"{re.escape(label)}"\s*,\s*"options"\s*:\s*\[',
        html,
    )
    if not m:
        return found
    start = m.end() - 1  # position of [
    depth = 0
    end = start
    for i in range(start, min(start + 10000, len(html))):
        if html[i] == "[":
            depth += 1
        elif html[i] == "]":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    try:
        options = json.loads(html[start:end])
        for opt in options:
            val = opt.get("label", "").strip()
            if val:
                found.append(val)
    except Exception:
        pass
    return found


def _extract_dom_variants(page) -> list[str]:
    """Extract variants from rendered DOM using universal selectors.

    Covers: <select> dropdowns, radio/button groups. Filters out
    cookie banners and non-product text.
    """
    _SKIP_WORDS = {"cookie", "cookies", "checkbox", "fonctionnalité", "publicit",
                   "analys", "personnali", "préférence", "préference",
                   "check box", "check-box", "optanon", "privacy", "consent",
                   "accept", "refuse", "refuser", "accepter", "tout", "fermer",
                   "close", "save", "saved", "settings", "paramètre", "réglage"}
    found: set[str] = set()

    # 1. <select> dropdowns — most universal (Shopify, Magento, etc.)
    try:
        selects = page.css("select")
        for sel in selects[:8]:
            name = (sel.attrib.get("name", "") + sel.attrib.get("id", "") + sel.attrib.get("aria-label", "")).lower()
            # Skip quantity/UI selects
            if any(w in name for w in ("qty", "quantity", "sort", "order", "limit", "page")):
                continue
            options = sel.css("option")
            for opt in options[1:]:  # skip placeholder
                txt = "".join(opt.get_all_text()).strip() if hasattr(opt, "get_all_text") else ""
                txt = txt.strip()
                if not txt or len(txt) > 30:
                    continue
                low = txt.lower()
                if any(w in low for w in _SKIP_WORDS):
                    continue
                found.add(txt)
    except Exception:
        pass

    # 2. Labels inside fieldset or form (size/color/variant selectors)
    try:
        for scope in ("fieldset", "form", "[class*=variant]", "[class*=swatch]",
                      "[class*=selector]", "[class*=picker]"):
            containers = page.css(scope)
            for container in containers[:3]:
                labels = container.css("label")
                for lab in labels[:30]:
                    txt = "".join(lab.get_all_text()).strip() if hasattr(lab, "get_all_text") else ""
                    txt = txt.strip()
                    if not txt or len(txt) > 30:
                        continue
                    low = txt.lower()
                    if any(w in low for w in _SKIP_WORDS):
                        continue
                    found.add(txt)
    except Exception:
        pass

    return list(found)


def _extract_css_text(page, selector: str) -> str | None:
    """Extract text from the first matching CSS element on a rendered page."""
    try:
        els = page.css(selector)
        if els:
            txt = els[0].get_all_text()
            return txt.strip() if txt else None
    except Exception:
        pass
    return None


def _classify_variants(variants: list[str]) -> tuple[list[str], list[str]]:
    """Separate a merged variant list into sizes and colors."""
    _SIZE_SET = set(SIZE_TOKENS)  # XXS..XXXL, 34..50
    _SIZE_SET.update({"ONE SIZE", "UNIQUE", "TU", "OS", "ONESIZE", "TAILLE UNIQUE"})
    # Common French/English color names that look like short size tokens
    _COLOR_WORDS = {
        "BLANC", "NOIR", "ROUGE", "BLEU", "VERT", "ROSE", "GRIS", "JAUNE",
        "MARRON", "BRUN", "BEIGE", "VIOLET", "ORANGE", "TURQUOISE", "KHAKI",
        "KAKI", "IVOIRE", "CRÈME", "CREME", "ECRU", "ÉCRU", "ARGENT", "OR",
        "WHITE", "BLACK", "RED", "BLUE", "GREEN", "PINK", "GREY", "GRAY",
        "YELLOW", "BROWN", "PURPLE", "SILVER", "GOLD", "NAVY", "CREAM",
        "CAMEL", "BURGUNDY", "CORAL", "TEAL", "MINT", "LAVENDER", "INDIGO",
        "COPPER", "BRONZE", "MAUVE", "OLIVE", "MUSTARD", "CRIMSON", "AQUA",
        "MAROON", "TAN", "DENIM", "COBALT", "SLATE", "CHARCOAL", "MAGENTA",
        "CYAN", "LILAC", "RUST", "SAGE", "TAUPE", "OCHRE", "JADE", "PLUM",
    }
    sizes: list[str] = []
    colors: list[str] = []
    _seen_colors_lower: set[str] = set()  # case-insensitive dedup

    _UI_GARBAGE = {
        "qte", "qté", "qty", "q.ty", "quantité", "quantity", "rechercher", "search",
        "add to cart", "ajouter au panier", "acheter", "buy",
        "select", "sélectionner", "choisir", "choose", "submit", "envoyer",
        "in stock", "out of stock", "en stock", "rupture",
        "ok", "cancel", "annuler", "size guide", "guide des tailles",
        "clear", "effacer", "reset", "réinitialiser",
        "select color", "select size", "sélectionne ta taille",
        "sélectionne ta taille / couleur", "sélectionnez votre taille",
        "choisissez votre taille", "taille", "couleur", "color", "size",
        # Brand names that leak into variant extraction
        "monki", "weekday", "cos", "arket", "other stories",
        "asos", "bershka", "pullbear", "pull bear", "stradivarius",
        "oysho", "massimo dutti", "lefties", "uterque",
        "zara", "hm", "uniqlo", "pimkie", "stüssy", "nike", "adidas",
    }

    def _classify_one(token: str) -> tuple[str, str] | None:
        """Classify a single token. Returns (kind, cleaned_value) or None to skip."""
        t = token.strip()
        if not t or t in ("-", "--", "---", "/", "."):
            return None
        low = t.lower()
        # UI garbage
        if low in _UI_GARBAGE:
            return None
        # Hex color codes: #000000, #fff, #a1b2c3
        if re.match(r"^#[0-9a-fA-F]{3,8}$", t):
            return None
        # Pure numeric tokens (with optional spaces): "0 0 0", "18 18 18", "255 255 255"
        if re.fullmatch(r"[\d\s]+", t):
            return None
        # SVG / UI icon noise
        _ICON_NOISE = {"icon", "view all icon", "minus icon", "plus icon",
                       "sound", "transparent", "loading", "spinner", "arrow",
                       "chevron", "hamburger", "search icon", "cart icon"}
        if low in _ICON_NOISE or any(w in low for w in ["icon", "transparent"]):
            return None
        # Vue/Angular template expressions: ${...}
        if "${" in t:
            return None
        # Currency codes and multi-line junk
        if t.upper() in ("EUR", "GBP", "USD", "CHF", "CAD", "AUD", "SEK", "DKK", "NOK", "PLN"):
            return None
        if re.search(r"[\n\r]", t):
            return None
        if re.match(r"^(color|colour|couleur|taille|size|choose|select|choisir)\s*:?\s*$", low):
            return None
        # Strip "Sélectionné, " / "Selected, " / "Non sélectionné, " prefixes (Zalando)
        t = re.sub(r"^(?i:sélectionné|sélectionnee|selected|non sélectionné|non sélectionnee|not selected|ausgewählt|nicht ausgewählt)\s*[,:\-]\s*", "", t).strip()
        # Strip leading "color:" or "couleur:" prefix, and trailing colon
        t = re.sub(r"^(?i:color|couleur)\s*:\s*", "", t).strip()
        t = re.sub(r"\s*:\s*$", "", t).strip()
        if not t:
            return None
        # Known color word → color
        if t.upper() in _COLOR_WORDS:
            return ("color", t)
        # Exact size token match
        if t.upper() in _SIZE_SET:
            return ("size", t)
        # Pure numeric: only classify as size if it looks like a clothing size
        # EU sizes: 34-50, UK/US sizes: 0-24, waist sizes: 26-40, shoe sizes: 36-46
        if t.isdigit():
            n = int(t)
            if 32 <= n <= 52:   # EU clothing
                return ("size", t)
            if 24 <= n <= 34:   # Waist/denim
                return ("size", t)
            if 2 <= n <= 22:    # US/UK numeric (2-22)
                return ("size", t)
            # Single digit or value outside known ranges → not a size (qty, other)
            return None
        # Alphanumeric with letters: sizes like "W32", "US4", "UK8", "EU36"
        if re.fullmatch(r"[A-Z]?\s*\d{1,2}", t) and 2 <= len(t) <= 5:
            return ("size", t)
        # Short uppercase alphanumeric with at least one letter (XS, XL, XXL variants)
        if re.fullmatch(r"[A-Z0-9 .\-]{1,6}", t) and len(t) <= 8 and re.search(r"[A-Z]", t):
            return ("size", t)
        # Multi-word: check if it contains a known color or size
        words = t.upper().split()
        if any(w in _COLOR_WORDS for w in words):
            return ("color", t)
        if any(w in _SIZE_SET for w in words):
            return ("size", t)
        # Remaining text — only classify as color if it looks like one.
        # Skip category names, newsletter topics, and other non-product text.
        _NOT_COLOR = {
            "alerte", "nouveauté", "nouveautes", "marque", "créateur", "createur",
            "mode", "promo", "promos", "soldes", "sondage", "sondages", "story",
            "stories", "recommandation", "recommandations", "article", "articles",
            "newsletter", "télécharger", "telecharger", "app", "qr", "code",
            "femme", "homme", "enfant", "bébé", "bebe", "fille", "garçon", "garcon",
            "download", "pour", "vos", "votre", "mes", "les", "des",
            "offre", "offres", "cadeau", "cadeaux", "livraison", "retour", "paiement",
            "service", "client", "contact", "aide", "compte", "connexion", "panier",
            "favori", "favoris", "wishlist", "blog", "magazine", "journal",
            "zalando", "zara", "cos", "hm", "uniqlo", "bershka", "pimkie",
            "stüssy", "stussy", "nike", "adidas", "puma",
            "monki", "weekday", "cos", "arket", "other stories", "and other stories",
            "asos", "bershka", "pullbear", "pull bear", "stradivarius", "oysho",
            "massimo dutti", "bershka", "lefties", "uterque",
            # Payment methods
            "american express", "apple pay", "klarna", "paypal", "visa", "mastercard",
            "amex", "cartes bancaires", "cartes", "carte bancaire", "cb", "sepa",
            "virement", "chèque", "cheque", "paiement en", "fois", "mensualité",
            "alma", "oney", "floa", "scalapay",
            # Navigation / UI chrome
            "accueil", "home", "boutique", "shop", "nouveautés", "collection",
            "vêtements", "vetements", "chaussures", "accessoires", "sacs",
            "maillots", "lingerie", "sport", "beauté", "beaute", "parfums",
            "décoration", "decoration", "meubles", "cuisine", "salle de bain",
            "idées cadeaux", "idees cadeaux", "carte cadeau", "carte",
            "électroménager", "electromenager", "high-tech", "informatique",
            "librairie", "papeterie", "alimentaire", "épicerie", "epicerie",
            "lifestyle", "culture", "musique", "vidéo", "video", "jeux",
            "top categories", "top brands", "nos marques", "nos produits",
            "découvrir", "decouvrir", "explorer", "s'inspirer", "sinspirer",
            "lookbook", "campagne", "édito", "edito", "éditorial", "editorial",
            # Product category labels
            "robes", "robes longues", "robes courtes", "robes midi",
            "pulls", "gilets", "manteaux", "vestes", "blousons", "pardessus",
            "chemises", "chemisiers", "tops", "t-shirts", "t shirt", "tshirt",
            "pantalons", "jeans", "jupes", "shorts", "bermudas",
            "sweats", "hoodies", "survêtements", "survetements",
            "costumes", "blazers", "tailleurs", "combinaisons", "combinaison",
            "maillots de bain", "bikinis", "tankinis",
            "sous-vêtements", "sous vetements", "soutiens-gorge", "culottes",
            "chaussettes", "collants", "leggings", "cyclistes",
            "baskets", "bottes", "sandales", "escarpins", "mocassins", "derbies",
            "sneakers", "talons", "plates", "compensées", "compensees",
            "lunettes", "bijoux", "montres", "ceintures", "foulards", "écharpes",
            "bonnets", "casquettes", "chapeaux", "gants",
            "bagues", "bracelets", "colliers", "boucles d'oreilles",
            "doudounes", "parkas", "trenchs", "imperméables",
            "polos", "débardeurs", "debardeurs", "caracos", "bodys",
            "mailles", "maille", "coton", "lin", "laine", "soie", "cuir", "daim",
            "cachemire", "jean", "denim", "jersey", "gaze", "gaze de coton",
            "viscose", "polyester", "élasthanne", "elastanne", "nylon", "acrylique",
            "popeline", "oxford", "twill", "velours", "satin", "mousseline",
            "gabardine", "tweed", "jacquard", "broderie", "crochet",
            "sélectionné", "selectionne", "selected", "not selected",
            "ausgewählt", "nicht ausgewählt", "selezionato",
            # Image gallery / carousel
            "vignette", "thumbnail", "photo", "image", "vue", "zoom",
            "diaporama", "carrousel", "carousel", "slide", "slider",
            "précédent", "precedent", "suivant", "next", "previous",
            "agrandir", "plein écran", "plein ecran", "fullscreen",
            # Cookie / consent
            "cookie", "cookies", "consentement", "consent", "privacy",
            "confidentialité", "confidentialite", "rgpd", "gdpr",
            "optanon", "onetrust", "didomi", "axeptio",
            "analytics", "personalization", "targeting", "tracking",
            "functional", "necessary", "marketing", "advertising",
            "ad storage", "ad user data", "ad personalization",
            "analytics and personalization",
            # Trustpilot / avis
            "trustpilot", "avis", "reviews", "évaluations", "evaluations",
            "note", "rating", "étoile", "etoile", "stars", "étoiles",
            # Social / sharing
            "facebook", "instagram", "twitter", "pinterest", "tiktok",
            "youtube", "linkedin", "snapchat", "whatsapp", "messenger",
            "partager", "share", "partage", "suivre", "follow", "s'abonner",
            "newsletter", "inscription", "subscribe", "sign up", "signup",
            # Powered by
            "powered by", "propulsé par", "propulse par",
            # Size / fit labels
            "regular", "slim", "skinny", "loose", "oversize", "relaxed",
            "tailored", "straight", "cropped", "long", "court",
            "longue", "courte", "mi-long", "mi long", "longueur",
            "coupe", "fit", "fitté", "fitte", "ample", "ajusté", "ajuste",
            # Misc UI
            "fermer", "close", "retour", "haut de page", "back to top",
            "menu", "burger", "hamburger", "recherche", "chercher",
            "search", "ok", "cancel", "annuler", "save", "enregistrer",
            "submit", "envoyer", "reset", "réinitialiser", "reinitialiser",
            "clear", "effacer", "apply", "appliquer", "filtrer", "filter",
            "trier", "sort", "tri", "ordre", "order",
            "vues", "views", "résultats", "results", "produits", "products",
            "articles", "items", "référence", "reference", "ref",
            "sku", "ean", "upc", "gtin", "isbn",
            "taille", "size", "couleur", "color", "quantité", "quantity", "qty",
            "description", "détails", "details", "composition", "entretien",
            "livraison", "retour", "échange", "echange", "remboursement",
            "guide", "guide des tailles", "size guide", "tableau",
        }
        words_lower = t.lower().split()
        if any(w in _NOT_COLOR for w in words_lower):
            return None
        # Must look like a color name: 1-3 words, max 25 chars per word
        if len(t) <= 30 and all(len(w) <= 25 for w in words_lower) and len(words_lower) <= 4:
            return ("color", t)
        return None

    for v in variants:
        v_clean = v.strip()
        if not v_clean:
            continue

        # Split combined variants like "Night Black / ONE SIZE"
        if " / " in v_clean:
            parts = v_clean.split(" / ")
        else:
            parts = [v_clean]

        for part in parts:
            classified = _classify_one(part)
            if classified is None:
                continue
            kind, value = classified
            if kind == "size":
                if value not in sizes:
                    sizes.append(value)
            elif kind == "color":
                # Normalize: replace hyphens with spaces for readability
                display = value.replace("-", " ").replace("_", " ")
                if display.lower() not in _seen_colors_lower:
                    _seen_colors_lower.add(display.lower())
                    colors.append(display)

    _SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"]
    sizes.sort(key=lambda s: (_SIZE_ORDER.index(s) if s in _SIZE_ORDER else len(_SIZE_ORDER) + int(s) if s.isdigit() else 999))
    colors.sort()

    return sizes, colors


def _extract_css_sizes(page) -> list[str]:
    """Extract size variants from a rendered page.

    Targets size-selector buttons and list items.
    """
    _SIZE_SET = set(SIZE_TOKENS)
    found: set[str] = set()
    for sel in (
        "[data-qa-action=size-selector] li",
        "[data-qa-action=size-selector] button",
        "[data-testid*=size-selector] button",
        "[data-testid*=size-selector] span",
        "[class*=size-selector] button",
        "[class*=size-selector] li",
        "[class*=product-size] button",
        "[class*=product-size] li",
    ):
        try:
            els = page.css(sel)
            for el in els[:30]:
                txt = getattr(el, "get_all_text", lambda: "")()
                if isinstance(txt, str):
                    txt = txt.strip()
                    if not txt:
                        continue
                    # Combined sizes like "XS/S" → split
                    if "/" in txt and len(txt) <= 10:
                        for part in txt.split("/"):
                            part = part.strip()
                            if part.upper() in _SIZE_SET:
                                found.add(part)
                    # Sizes are short tokens, not long descriptions
                    elif len(txt) <= 6 and (txt.upper() in _SIZE_SET or txt.isdigit()):
                        found.add(txt)
        except Exception:
            pass
        if len(found) >= 10:
            break
    return list(found)


def _extract_css_colors(page) -> list[str]:
    """Extract color variants from a rendered page (Zara, COS, Shopify etc.).

    Targets data-qa attributes, swatch classes, and Shopify variant selectors.
    """
    found: set[str] = set()
    for sel in (
        "[data-qa-action=select-color]",
        "[class*=color-item] button",
        "[class*=color-selector] button",
        "[class*=swatch]",
        # Shopify color options — labels on radio/option selectors
        "fieldset[class*=product] label",
        "[data-option-name*='olor'] label",
        "[data-option-name*='olor'] option",
        "input[type='radio'][name*='olor' i] + label",
    ):
        try:
            els = page.css(sel)
            for el in els[:30]:
                txt = getattr(el, "get_all_text", lambda: "")()
                if isinstance(txt, str):
                    txt = txt.strip()
                    if 1 < len(txt) < 50 and not txt.startswith("€") and not txt.isdigit():
                        found.add(txt)
        except Exception:
            pass
        if len(found) >= 12:
            break
    return list(found)


def _extract_shopify_colors(page, html: str) -> list[str]:
    """Extract color names from Shopify product option labels.

    Shopify themes label color options with the full product title
    (e.g. \"DEMON TEE WHITE\", \"DEMON TEE WIND GREY\").
    This strips the common product-name prefix to isolate the color.
    """
    labels: list[str] = []
    # Collect all labels that look like product option switches
    for sel in (
        "fieldset[class*=product] label",
        "[class*=product-form] fieldset label",
        ".variant-picker label",
        "[data-option-name] label",
    ):
        try:
            for el in page.css(sel):
                txt = getattr(el, "get_all_text", lambda: "")()
                if isinstance(txt, str):
                    txt = txt.strip()
                    if 10 < len(txt) < 60:
                        labels.append(txt)
        except Exception:
            pass

    if not labels:
        return []

    # Find the product base name — the part shared across all labels
    # or extract it from og:title / <title>
    base = _pick_meta(html, "og:title") or _extract_title(html) or ""
    # Try to strip the base product name without its last color word
    # e.g. "DEMON TEE WHITE" → "DEMON TEE" (strip last word if it's a color)
    _COLOR_WORDS = {
        "BLANC", "NOIR", "ROUGE", "BLEU", "VERT", "ROSE", "GRIS", "JAUNE",
        "MARRON", "BRUN", "BEIGE", "VIOLET", "ORANGE", "TURQUOISE", "KHAKI",
        "KAKI", "IVOIRE", "CRÈME", "CREME", "ECRU", "ÉCRU", "ARGENT", "OR",
        "WHITE", "BLACK", "RED", "BLUE", "GREEN", "PINK", "GREY", "GRAY",
        "YELLOW", "BROWN", "PURPLE", "SILVER", "GOLD", "NAVY", "CREAM",
        "CAMEL", "BURGUNDY", "CORAL", "TEAL", "MINT", "LAVENDER", "INDIGO",
        "COPPER", "BRONZE", "MAUVE", "OLIVE", "MUSTARD", "CRIMSON", "AQUA",
        "MAROON", "TAN", "DENIM", "COBALT", "SLATE", "CHARCOAL", "MAGENTA",
        "CYAN", "LILAC", "RUST", "SAGE", "TAUPE", "OCHRE", "JADE", "PLUM",
    }
    base_words = base.upper().split()
    if base_words and base_words[-1] in _COLOR_WORDS:
        base = " ".join(base_words[:-1])

    colors: list[str] = []
    _seen: set[str] = set()
    for label in labels:
        # Remove the base product name prefix
        if base and label.upper().startswith(base.upper()):
            color = label[len(base):].strip()
        else:
            color = label
        if color and color.lower() not in _seen:
            _seen.add(color.lower())
            colors.append(color)

    return colors


def _extract_css_image(page, url: str = "") -> str | None:
    """Extract the main product image from a rendered page.

    Skips SVGs, tracking pixels, cookie banners, transparent placeholders.
    Prefers product-detail images, then large images on product CDN.
    """
    import re as _re
    from urllib.parse import urlparse as _urlparse

    product_domain = _urlparse(url).netloc if url else ""
    _BAD_DOMAINS = {"cookielaw.org", "onetrust.com", "google.com", "facebook.net",
                    "doubleclick.net", "googletagmanager.com", "consensu.org"}
    _BAD_PATH_FRAGMENTS = {
        "flag", "flags", "drapeau", "drapeaux", "logo", "logos", "icon", "icons",
        "picto", "pictos", "pictogram", "pictograms", "avatar", "favicon",
        "banner", "banniere", "pub", "advertisement", "ad/", "/ad-",
        "payment", "paiement", "trustpilot", "badge", "badges", "label",
        "cookie", "cookies", "consent", "optanon", "onetrust",
        "footer", "header", "sidebar", "widget", "button", "btn",
        "spinner", "loader", "placeholder", "swatch", "pixel",
        "1x1", "tracking", "beacon", "analytics", "pixel.gif",
    }

    try:
        imgs = page.css("img")
        candidates: list[tuple[int, str]] = []  # (score, src)

        for img in imgs[:50]:
            src = img.attrib.get("src") or img.attrib.get("data-src") or ""
            # Also check srcset (Zara, other modern retailers) — take the first URL
            if not src:
                srcset = img.attrib.get("srcset", "")
                if srcset:
                    src = srcset.split(",")[0].strip().split(" ")[0]
            if not src:
                continue
            # Fix double-URL bug (https://a.comhttps://a.com/path → https://a.com/path)
            second_http = src.find("http", 8) if src.startswith("http") else -1
            if second_http > 0:
                src = src[second_http:]
            low = src.lower()
            # Skip data: URIs (SVG placeholders, inline icons, 1x1 tracking pixels)
            if low.startswith("data:") or low in ("data:image/gif;base64,r0lgodlhaqabaaaaaach5baekaaaealaaaaaaabaaaeaaaictaeaow==",):
                continue
            if "transparent" in low:
                continue
            if _re.search(r"\.svg(\?|$)", low):
                continue
            # Skip 1x1 tracking pixels
            if _re.search(r"1x1(?:\.gif|\.png|\.jpg)", low):
                continue
            if _re.search(r"spacer\.(?:gif|png)", low):
                continue
                continue
            if _re.search(r"\.svg(\?|$)", low):
                continue
            # Skip tracking pixels, Akamai, flags, icons, logos
            if any(bad in low for bad in _BAD_PATH_FRAGMENTS):
                continue

            # Skip known non-product domains (substring match)
            try:
                img_domain = _urlparse(src).netloc.lower()
                if any(bad in img_domain for bad in _BAD_DOMAINS):
                    continue
            except Exception:
                pass

            score = 0
            classes = img.attrib.get("class", "").lower()
            if "product" in classes or "main-image" in classes:
                score += 30
            if product_domain and product_domain in low:
                score += 20
            if "static." in low or "assets" in low or "cdn" in low:
                score += 10
            if any(ext in low for ext in (".jpg?", ".jpeg?", ".png?", ".webp?", ".avif?")):
                score += 15
            if not _re.search(r"\.(svg|gif)(\?|$)", low):
                score += 5

            candidates.append((score, src))

        # Return highest scoring image
        candidates.sort(key=lambda x: x[0], reverse=True)
        if candidates and candidates[0][0] > 0:
            return candidates[0][1]

        # If no good candidates, return first non-bad image longer than 60 chars
        for img in imgs[:50]:
            src = img.attrib.get("src") or img.attrib.get("data-src") or ""
            if not src:
                srcset = img.attrib.get("srcset", "")
                if srcset:
                    src = srcset.split(",")[0].strip().split(" ")[0]
            if not src:
                continue
            # Fix double-URL bug (https://a.comhttps://a.com/path → https://a.com/path)
            second_http = src.find("http", 8) if src.startswith("http") else -1
            if second_http > 0:
                src = src[second_http:]
            low = src.lower()
            if not src or "transparent" in low or _re.search(r"\.svg(\?|$)", low):
                continue
            if any(bad in low for bad in _BAD_PATH_FRAGMENTS):
                continue
            try:
                if any(bad in _urlparse(src).netloc.lower() for bad in _BAD_DOMAINS):
                    continue
            except Exception:
                pass
            if len(src) > 60:
                return src
    except Exception:
        pass
    # Fallback: search raw HTML for product images
    html = getattr(page, "html_content", "")
    # 1. og:image meta tag
    m = _re.search(
        r'(?:property|name)=["\']og:image["\'][^>]+content=["\']([^"\']+)',
        html,
        _re.IGNORECASE,
    )
    if m:
        return m.group(1)
    # 2. imagesrcset / srcset preload links (Zara, React Helmet)
    for attr in ("imagesrcset", "srcset"):
        m = _re.search(
            rf'{attr}=["\']([^"\']*?(?:\.jpg|\.jpeg|\.png|\.webp)[^"\']*)["\']',
            html,
            _re.IGNORECASE,
        )
        if m:
            # Take the first URL from the set
            first = m.group(1).split(",")[0].strip().split(" ")[0]
            # Decode HTML entities
            first = first.replace("&amp;", "&")
            if len(first) > 40:
                return first
    # 3. JSON-LD image field
    for m in _re.finditer(
        r'<script type="application/ld\+json"[^>]*>(.*?)</script>',
        html,
        _re.DOTALL,
    ):
        try:
            data = __import__("json").loads(m.group(1))
            if isinstance(data, dict):
                img = data.get("image")
                if isinstance(img, str) and img.startswith("http"):
                    return img
                if isinstance(img, list) and img:
                    return img[0]
        except Exception:
            pass
    return None


def _extract_css_price(page) -> float | None:
    """Extract price from rendered page CSS selectors."""
    import re as _re

    for selector in ("[class*=price]", "[class*=amount]", "[itemprop=price]"):
        try:
            els = page.css(selector)
            for el in els[:5]:
                raw = el.get_all_text()
                if isinstance(raw, str):
                    # Extract first number with currency
                    m = _re.search(r"(\d{1,4}(?:[.,]\d{2})?)\s*(?:€|EUR|USD|\$)", raw)
                    if m:
                        return float(m.group(1).replace(",", "."))
        except Exception:
            pass
    return None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "proxy": bool(os.getenv("PROXY_URL")),
        "twilio": bool(TWILIO_SID),
    }


@app.get("/unsubscribe")
async def unsubscribe(watch_id: str = Query(min_length=1)):
    """Deactivate a watch and show a confirmation page."""
    from db.client import supabase as _supabase

    _DARK = "#0F0F0F"
    _CREAM = "#FAFAF8"
    _ORANGE = "#E85D2C"
    _MUTED = "#9CA3AF"

    import uuid as _uuid
    valid = False
    try:
        _uuid.UUID(watch_id)
        valid = True
    except ValueError:
        pass

    if valid:
        try:
            _supabase.table("watches").update({"is_active": False}).eq("id", watch_id).execute()
            title = "Alerte désactivée"
            message = "Tu ne recevras plus d'emails pour ce produit."
        except Exception:
            title = "Erreur"
            message = "Une erreur est survenue. Réessaie plus tard."
    else:
        title = "Lien invalide"
        message = "Tu peux gérer tes alertes depuis ton tableau de bord."

    html = f"""<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{title} — restocking</title></head>
<body style="margin:0;padding:0;background:{_CREAM};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:80px 16px;">
<tr><td align="center">
  <table width="400" cellpadding="0" cellspacing="0" style="background:#fff;border:2px solid {_DARK};border-radius:20px;max-width:400px;width:100%;text-align:center;">
    <tr><td style="padding:40px 32px;">
      <img src="https://www.restocking.app/apple-touch-icon.png" width="60" height="60" alt="restocking" style="display:block;margin:0 auto 20px;border-radius:16px;" />
      <h1 style="margin:0;font-size:22px;font-weight:800;color:{_DARK};letter-spacing:-0.02em;">{title}</h1>
      <p style="margin:12px 0 0 0;font-size:15px;color:{_MUTED};line-height:1.5;">{message}</p>
      <a href="https://www.restocking.app/dashboard" style="display:inline-block;margin-top:24px;background:{_DARK};color:#fff;text-decoration:none;padding:12px 28px;border-radius:9999px;font-size:14px;font-weight:600;">Tableau de bord</a>
    </td></tr>
  </table>
</td></tr></table></body></html>"""

    return HTMLResponse(content=html, status_code=200)

@app.get("/my-ip")
async def my_ip():
    """Return the server's outbound IP — used to whitelist in proxy providers."""
    import httpx as _httpx
    try:
        resp = await _httpx.AsyncClient(timeout=10).get("https://api.ipify.org")
        return {"ip": resp.text.strip()}
    except Exception:
        return {"ip": "unknown"}


@app.get("/image-proxy")
async def image_proxy(img_url: str = Query(min_length=1, alias="url")):
    """Proxy an image through the worker to bypass CDN hotlink protection.

    Uses browser-like headers so CDNs (Pull&Bear, Inditex, etc.) serve the image.
    """
    try:
        parsed = urlparse(img_url)
        if parsed.scheme not in ("http", "https"):
            raise HTTPException(status_code=400, detail="Invalid URL scheme")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid URL")

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                img_url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
                    "Referer": f"{parsed.scheme}://{parsed.hostname}/",
                    "Sec-Fetch-Dest": "image",
                    "Sec-Fetch-Mode": "no-cors",
                    "Sec-Fetch-Site": "same-origin",
                },
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail=f"Upstream returned {resp.status_code}")

            content_type = resp.headers.get("content-type", "image/jpeg")
            return StreamingResponse(
                content=iter([resp.content]),
                media_type=content_type,
                headers={"Cache-Control": "public, max-age=86400"},
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)[:200])


# ---------------------------------------------------------------------------
# OTP phone verification
# ---------------------------------------------------------------------------

# { phone: { code, expires_at } }
_pending_otps: dict[str, dict] = {}

TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM = os.getenv("TWILIO_PHONE_NUMBER", "")


@app.post("/send-otp")
async def send_otp(phone: str = Query(min_length=6)):
    """Send a 6-digit OTP code to the given phone number via Twilio."""
    if not TWILIO_SID or not TWILIO_TOKEN:
        raise HTTPException(status_code=503, detail="Twilio not configured")

    # Rate limit: 60s between sends for the same number
    existing = _pending_otps.get(phone)
    if existing and time.monotonic() - existing.get("last_sent", 0) < 60:
        raise HTTPException(status_code=429, detail="Too soon — wait 60 seconds")

    code = str(random.randint(100000, 999999))

    # Send via Twilio
    try:
        from twilio.rest import Client as TwilioClient
        client = TwilioClient(TWILIO_SID, TWILIO_TOKEN)
        msg = client.messages.create(
            body=f"Restocking — code de vérification : {code}",
            from_=TWILIO_FROM,
            to=phone,
        )
        logger.info("Twilio SMS sent — SID=%s to=%s", msg.sid, phone)
    except Exception as e:
        logger.exception("Twilio send failed for %s: %s", phone, str(e))
        raise HTTPException(status_code=502, detail=f"Could not send SMS: {str(e)[:120]}")

    _pending_otps[phone] = {"code": code, "expires_at": time.monotonic() + 300, "last_sent": time.monotonic()}
    logger.info("OTP sent to %s", phone)
    return {"ok": True}


@app.post("/verify-otp")
async def verify_otp(phone: str = Query(min_length=6), code: str = Query(min_length=6, max_length=6)):
    """Verify a 6-digit OTP code."""
    entry = _pending_otps.get(phone)
    if not entry:
        raise HTTPException(status_code=404, detail="No pending OTP for this number")

    if time.monotonic() > entry["expires_at"]:
        del _pending_otps[phone]
        raise HTTPException(status_code=410, detail="OTP expired")

    if entry["code"] != code:
        raise HTTPException(status_code=403, detail="Invalid code")

    del _pending_otps[phone]
    logger.info("Phone %s verified", phone)
    return {"ok": True, "verified": True}


@app.get("/debug-playwright")
async def debug_playwright():
    """Test Playwright rendering with proxy."""
    import asyncio as _asyncio
    url = "https://www.zara.com/fr/fr/basket-avec-detail-au-talon-p12246720.html"
    pw_proxy_debug = None
    proxy_url_debug = os.getenv("PROXY_URL")
    if proxy_url_debug:
        try:
            from urllib.parse import urlparse as _urlparse
            _p = _urlparse(proxy_url_debug)
            pw_proxy_debug = {"server": f"{_p.scheme}://{_p.hostname}:{_p.port or 80}"}
            if _p.username:
                pw_proxy_debug["username"] = _p.username
            if _p.password:
                pw_proxy_debug["password"] = _p.password
        except Exception as e:
            pw_proxy_debug = {"error": str(e)}

    try:
        page = await _asyncio.to_thread(
            PlayWrightFetcher.fetch,
            url,
            headless=True,
            stealth=True,
            hide_canvas=True,
            disable_resources=True,
            timeout=40000,
            wait=3000,
            proxy=pw_proxy_debug,
        )
        html = getattr(page, "html_content", "")
        return {
            "ok": True,
            "html_len": len(html),
            "proxy_configured": bool(proxy_url_debug),
            "proxy_dict": pw_proxy_debug,
        }
    except Exception as e:
        return {
            "ok": False,
            "error": str(e)[:300],
            "proxy_configured": bool(proxy_url_debug),
            "proxy_dict": pw_proxy_debug,
        }


def _is_shopify(url: str, html: str) -> bool:
    """Detect whether a page is running on Shopify."""
    # URL-based: myshopify.com admin or cname
    if "myshopify.com" in url or "/products/" not in url:
        return "myshopify.com" in url
    # HTML-based: Shopify CDN, checkout domain, or platform signatures
    indicators = (
        "cdn.shopify.com",
        "checkout.shopify.com",
        "shopify.shop",
        "Shopify.shop",
        "shopify.com",
        "myshopify.com",
    )
    return any(indicator in html for indicator in indicators)


def _sse_event(event: str, data: dict) -> str:
    """Format a Server-Sent Event line."""
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


async def _analyze_scrape(url: str, proxy_url: str | None = None, pw_proxy: dict | None = None):
    """Core scraping logic — shared by SSE streaming and JSON endpoints.

    No proxy usage here — the /analyze endpoint is a free preview.
    Proxy is reserved for Pro plan monitoring in the main worker loop.

    Yields SSE-formatted progress/result/error event strings.
    """
    import asyncio as _asyncio

    html: str | None = None
    page = None
    _was_playwright = False

    def _http_attempt():
        nonlocal page, html
        kwargs: dict = {"stealthy_headers": True, "timeout": 15}
        page = Fetcher.get(url, **kwargs)
        if getattr(page, "status", 0) in (200, 304):
            html = getattr(page, "html_content", "")
            if html and len(html) < 5000:
                logger.debug("Level 1 HTML too small (%d bytes) — escalating", len(html))
                html = None

    def _pw_attempt(disable_resources: bool = True, timeout: int = 40000):
        nonlocal page, html
        kwargs: dict = {
            "headless": True, "stealth": True, "hide_canvas": True,
            "disable_resources": disable_resources, "timeout": timeout, "wait": 3000,
        }
        page = PlayWrightFetcher.fetch(url, **kwargs)
        html = getattr(page, "html_content", "")

    # Level 1 — HTTP
    yield _sse_event("progress", {"step": "http", "message": "Connexion au site..."})
    try:
        await _asyncio.to_thread(_http_attempt)
    except Exception:
        logger.debug("Level 1 (HTTP) failed", exc_info=True)

    # Level 2 — Playwright stealth
    if html is None:
        _was_playwright = True
        yield _sse_event("progress", {"step": "playwright", "message": "Ouverture du navigateur..."})
        try:
            await _asyncio.to_thread(_pw_attempt, True, 40000)
        except Exception:
            logger.debug("Level 2 (Playwright) failed", exc_info=True)

    # Level 3 — Playwright best effort
    if html is None:
        yield _sse_event("progress", {"step": "playwright_retry", "message": "Nouvelle tentative..."})
        try:
            await _asyncio.to_thread(_pw_attempt, False, 30000)
        except Exception:
            logger.debug("Level 3 (Playwright best-effort) failed", exc_info=True)

    if not html:
        yield _sse_event("error", {"error": "All fetch levels failed"})
        return

    # --- Universal extraction ---
    yield _sse_event("progress", {"step": "extracting", "message": "Lecture du produit..."})
    result = await _universal_extract(page, html, url)

    # --- LLM validation (DeepSeek) — runs on every request to cross-check results ---
    if _DEEPSEEK_KEY:
        yield _sse_event("progress", {"step": "extracting", "message": "Vérification des données..."})
        try:
            llm_result = await _llm_extract(html, page, url)
            if llm_result:
                # Name: prefer LLM when it finds a product-specific name (not generic)
                llm_name = llm_result.get("name")
                if llm_name and (
                    not result.get("name") or
                    # Override generic names (brand-only, category-only)
                    len(llm_name) > len(result.get("name", "") or "") or
                    len(result.get("name", "") or "") < 25
                ):
                    result["name"] = llm_name
                # Price: LLM as fallback for missing prices
                if result.get("price") is None and llm_result.get("price"):
                    result["price"] = llm_result["price"]
                # Image: LLM as fallback for missing images
                if not result.get("image_url") and llm_result.get("image_url"):
                    result["image_url"] = llm_result["image_url"]
                # Colors: LLM overrides — regex picks up recommended product names
                llm_colors = llm_result.get("colors") or []
                if llm_colors:
                    result["colors"] = llm_colors
                # Sizes: LLM overrides when it finds results (avoids recommended product junk)
                llm_sizes = llm_result.get("sizes") or []
                if llm_sizes:
                    result["sizes"] = llm_sizes
                    # Update variants to match
                    result["variants"] = llm_sizes + (result.get("colors") or [])
                logger.info("LLM validated: name=%s sizes=%s colors=%s",
                            result.get("name"), result.get("sizes"), result.get("colors"))
        except Exception:
            logger.debug("LLM validation failed", exc_info=True)

    # If no sizes found and we only did Level 1 HTTP, try Playwright
    # for JS-rendered size selectors (COS, other SPA retailers).
    # Also trigger if colors are missing on Shopify — theme variants are
    # rendered client-side and static HTML can't see them.
    _needs_pw = not result.get("sizes")
    if not _needs_pw and not result.get("colors") and _is_shopify(url, html):
        _needs_pw = True
    logger.debug("Post-extract: sizes=%s colors=%s was_playwright=%s needs_pw=%s",
                 result.get("sizes"), result.get("colors"), _was_playwright, _needs_pw)
    if _needs_pw and page is not None and not _was_playwright:
        try:
            pw_page = await _asyncio.to_thread(
                PlayWrightFetcher.fetch,
                url,
                headless=True,
                stealth=True,
                hide_canvas=True,
                disable_resources=True,
                timeout=20000,
                wait=2000,
            )
            pw_html = getattr(pw_page, "html_content", "")
            if pw_html:
                pw_result = await _universal_extract(pw_page, pw_html, url)
                if pw_result["sizes"]:
                    result["sizes"] = pw_result["sizes"]
                if pw_result["colors"]:
                    result["colors"] = pw_result["colors"]
                if pw_result["variants"]:
                    result["variants"] = pw_result["variants"]
        except Exception:
            logger.debug("Playwright fallback for sizes failed", exc_info=True)

    yield _sse_event("result", {"ok": True, "url": url, **result})


@app.get("/analyze")
async def analyze(request: Request, url: str = Query(min_length=1)):
    """Scrape a product URL and return metadata.

    Returns SSE streaming progress when Accept: text/event-stream is set,
    or plain JSON otherwise.

    All scraping runs via asyncio.to_thread to keep Playwright
    out of the uvicorn event loop and avoid asyncio conflicts.
    """
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            raise HTTPException(status_code=400, detail="Invalid URL scheme")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid URL")

    # SSE streaming path (client-side fetch from the frontend)
    if "text/event-stream" in request.headers.get("accept", ""):
        return StreamingResponse(
            _analyze_scrape(url),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        )

    # JSON path (server-action / backward compat)
    result = None
    async for event_str in _analyze_scrape(url):
        for line in event_str.split("\n"):
            if line.startswith("data: "):
                data = json.loads(line[6:])
                if "ok" in data:
                    result = data
                elif "error" in data:
                    raise HTTPException(status_code=502, detail=data["error"])

    if result is None:
        raise HTTPException(status_code=502, detail="All fetch levels failed")
    return result
