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
from starlette.responses import StreamingResponse

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
    # 3. Regex fallback — take the highest price found (product > shipping fees)
    prices: list[float] = []
    for m in re.finditer(r"(\d{1,4}(?:[.,]\d{2})?)\s*€", html):
        try:
            prices.append(float(m.group(1).replace(",", ".")))
        except (ValueError, TypeError):
            pass
    if prices:
        return max(prices)
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
        found.add(m.group(1).strip())
        if len(found) > 24:
            break

    return list(found)[:18]


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

    # JSON-LD
    for m in re.finditer(
        r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>',
        html, re.DOTALL,
    ):
        try:
            data = json.loads(m.group(1))
            parts.append(f"JSON-LD: {json.dumps(data, ensure_ascii=False)[:6000]}")
        except Exception:
            pass

    # Select dropdowns
    if page is not None:
        try:
            for sel in page.css("select"):
                name = sel.attrib.get("name", "") or sel.attrib.get("aria-label", "") or sel.attrib.get("id", "")
                opts: list[str] = []
                for opt in sel.css("option"):
                    txt = (opt.get_all_text() or "").strip()
                    if txt and txt not in ("--", "-", "Select", "Choisir", "Sélectionner"):
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

    # Aria-labels on buttons/links inside product sections (color/size selectors)
    if page is not None:
        try:
            color_candidates: set[str] = set()
            size_candidates: set[str] = set()
            other_labels: set[str] = set()
            for sel in (
                "button[aria-label]",
                "[class*=product] [aria-label]",
                "[class*=selector] [aria-label]",
                "[class*=color] [aria-label]",
                "[class*=size] [aria-label]",
            ):
                for el in page.css(sel):
                    label = (el.attrib.get("aria-label") or "").strip()
                    if not label or len(label) > 30:
                        continue
                    # Heuristic: if it looks like a color word, put in color_candidates
                    if re.search(r"(?:Bleu|Blanc|Noir|Rouge|Jaune|Vert|Rose|Gris|Brun|Orange|Violet|Marron|Beige|Ivoire|Kaki|Argent|Doré|Turquoise|Bordeaux|Lavande)", label, re.I):
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

    # Visible text from product-related sections (first ~2000 chars)
    if page is not None:
        try:
            for sel in (
                "[class*=product-detail]",
                "[class*=product-info]",
                "[class*=pdp]",
                "main",
                "[class*=product]",
            ):
                els = page.css(sel)
                if els:
                    txt = els[0].get_all_text()
                    if isinstance(txt, str) and len(txt) > 50:
                        parts.append(f"Body text: {txt[:2000]}")
                        break
        except Exception:
            pass

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
    # Priority: og:image meta > DOM largest product image > imagesrcset
    image_url = _pick_meta(html, "og:image")
    if not image_url:
        image_url = _extract_css_image(page, url)
    if image_url and image_url.startswith("http://"):
        image_url = image_url.replace("http://", "https://", 1)
    result["image_url"] = image_url

    # Download the product image as base64 via httpx with browser headers.
    # Many CDNs (Pull&Bear/Inditex, Stüssy) block direct <img> tags from
    # other origins. Base64 inline avoids the block entirely.
    if image_url:
        result["image_base64"] = await _download_image_base64(image_url, url)

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

    sizes, colors = _classify_variants(variants)
    result["variants"] = variants
    result["sizes"] = sizes
    result["colors"] = colors

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
    }

    def _classify_one(token: str) -> str | None:
        """Classify a single token as 'size', 'color', or None (skip)."""
        t = token.strip()
        if not t:
            return None
        low = t.lower()
        if low in _UI_GARBAGE:
            return None
        # Known color word → color
        if t.upper() in _COLOR_WORDS:
            return "color"
        # Exact size token match
        if t.upper() in _SIZE_SET:
            return "size"
        # Short uppercase alphanumeric → size
        if re.fullmatch(r"[A-Z0-9 .\-]{1,6}", t) and len(t) <= 8:
            return "size"
        # Pure numeric → size
        if t.isdigit():
            return "size"
        # Multi-word: check if it contains a known color or size
        words = t.upper().split()
        if any(w in _COLOR_WORDS for w in words):
            return "color"
        if any(w in _SIZE_SET for w in words):
            return "size"
        # Remaining longer text → color (conservative: multi-word color names)
        if len(t) <= 40:
            return "color"
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
            kind = _classify_one(part)
            if kind == "size":
                if part not in sizes:
                    sizes.append(part)
            elif kind == "color":
                if part not in colors:
                    colors.append(part)

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
    """Extract color variants from a rendered page (Zara, COS, etc.).

    Targets elements with data-qa-action='select-color' or class '*color-item*'.
    """
    found: set[str] = set()
    for sel in (
        "[data-qa-action=select-color]",
        "[class*=color-item] button",
        "[class*=color-selector] button",
        "[class*=swatch]",
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
            low = src.lower()
            if "transparent" in low:
                continue
            if _re.search(r"\.svg(\?|$)", low):
                continue
            if any(bad in low for bad in ("/pixel", "/akam", "tracking", "beacon")):
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
            low = src.lower()
            if not src or "transparent" in low or _re.search(r"\.svg(\?|$)", low):
                continue
            if any(bad in low for bad in ("/pixel", "/akam", "tracking", "beacon")):
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


def _sse_event(event: str, data: dict) -> str:
    """Format a Server-Sent Event line."""
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


async def _analyze_scrape(url: str, proxy_url: str | None, pw_proxy: dict | None):
    """Core scraping logic — shared by SSE streaming and JSON endpoints.

    Yields SSE-formatted progress/result/error event strings.
    """
    import asyncio as _asyncio

    html: str | None = None
    page = None
    _was_playwright = False

    # Level 1 — plain HTTP
    yield _sse_event("progress", {"step": "http", "message": "Connexion au site..."})
    try:
        kwargs = {"stealthy_headers": True, "timeout": 15}
        if proxy_url:
            kwargs["proxy"] = proxy_url
        page = await _asyncio.to_thread(Fetcher.get, url, **kwargs)
        if getattr(page, "status", 0) in (200, 304):
            html = getattr(page, "html_content", "")
            if html and len(html) < 5000:
                logger.debug("Level 1 HTML too small (%d bytes) — escalating", len(html))
                html = None
    except Exception:
        logger.debug("Level 1 (Fetcher) failed", exc_info=True)

    # Level 2 — Playwright stealth
    if html is None:
        _was_playwright = True
        yield _sse_event("progress", {"step": "playwright", "message": "Ouverture du navigateur..."})
        try:
            pw_kwargs = {
                "headless": True,
                "stealth": True,
                "hide_canvas": True,
                "disable_resources": True,
                "timeout": 40000,
                "wait": 3000,
            }
            if pw_proxy:
                pw_kwargs["proxy"] = pw_proxy
            logger.info("Level 2 Playwright attempt — url=%s proxy=%s", url[:60], bool(pw_proxy))
            page = await _asyncio.to_thread(
                PlayWrightFetcher.fetch,
                url,
                **pw_kwargs,
            )
            html = getattr(page, "html_content", "")
        except Exception:
            logger.exception("Level 2 (PlayWrightFetcher) failed")

    # Level 3 — Playwright best effort
    if html is None:
        yield _sse_event("progress", {"step": "playwright_retry", "message": "Nouvelle tentative..."})
        try:
            pw3_kwargs = {
                "headless": True,
                "stealth": True,
                "hide_canvas": True,
                "timeout": 30000,
                "wait": 3000,
            }
            if pw_proxy:
                pw3_kwargs["proxy"] = pw_proxy
            page = await _asyncio.to_thread(
                PlayWrightFetcher.fetch,
                url,
                **pw3_kwargs,
            )
            html = getattr(page, "html_content", "")
        except Exception:
            logger.debug("Level 3 (PlayWrightFetcher) failed", exc_info=True)

    if not html:
        yield _sse_event("error", {"error": "All fetch levels failed"})
        return

    # --- Universal extraction ---
    yield _sse_event("progress", {"step": "extracting", "message": "Lecture du produit..."})
    result = await _universal_extract(page, html, url)

    # --- LLM enrichment (DeepSeek) — fills gaps in traditional extraction ---
    if _DEEPSEEK_KEY:
        try:
            llm_result = await _llm_extract(html, page, url)
            if llm_result:
                # Merge: traditional is more reliable for structured data,
                # LLM is better at colors and natural-language names
                if not result.get("name") and llm_result.get("name"):
                    result["name"] = llm_result["name"]
                if result.get("price") is None and llm_result.get("price"):
                    result["price"] = llm_result["price"]
                if not result.get("image_url") and llm_result.get("image_url"):
                    result["image_url"] = llm_result["image_url"]
                # Colors: LLM is often better — merge both
                llm_colors = llm_result.get("colors") or []
                existing_colors = set(result.get("colors") or [])
                for c in llm_colors:
                    if c not in existing_colors:
                        result["colors"].append(c)
                # Sizes: merge both, deduplicate
                llm_sizes = llm_result.get("sizes") or []
                existing_sizes = set(result.get("sizes") or [])
                for s in llm_sizes:
                    if s not in existing_sizes:
                        result["sizes"].append(s)
                        result["variants"].append(s)
                logger.debug("LLM merge: sizes=%s colors=%s", result["sizes"], result["colors"])
        except Exception:
            logger.debug("LLM enrichment failed", exc_info=True)

    # If no sizes found and we only did Level 1 HTTP, try Playwright
    # for JS-rendered size selectors (COS, other SPA retailers).
    logger.debug("Post-extract: sizes=%s was_playwright=%s", result.get("sizes"), _was_playwright)
    if not result.get("sizes") and page is not None and not _was_playwright:
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

    proxy_url = os.getenv("PROXY_URL")

    # For Playwright, proxy must be a dict with server/username/password
    pw_proxy: dict | None = None
    if proxy_url:
        try:
            from urllib.parse import urlparse as _urlparse
            _p = _urlparse(proxy_url)
            pw_proxy = {"server": f"{_p.scheme}://{_p.hostname}:{_p.port or 80}"}
            if _p.username:
                pw_proxy["username"] = _p.username
            if _p.password:
                pw_proxy["password"] = _p.password
        except Exception:
            pw_proxy = None
            logger.debug("Failed to parse PROXY_URL, ignoring", exc_info=True)

    # SSE streaming path (client-side fetch from the frontend)
    if "text/event-stream" in request.headers.get("accept", ""):
        return StreamingResponse(
            _analyze_scrape(url, proxy_url, pw_proxy),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        )

    # JSON path (server-action / backward compat)
    result = None
    async for event_str in _analyze_scrape(url, proxy_url, pw_proxy):
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
