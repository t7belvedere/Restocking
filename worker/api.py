"""FastAPI app — exposes /analyze so the frontend can delegate scraping to the worker."""

import logging
import re
from urllib.parse import urlparse

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from scrapling.fetchers import Fetcher, PlayWrightFetcher

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
    # Common French/English color names that look like short size tokens
    _COLOR_WORDS = {
        "BLANC", "NOIR", "ROUGE", "BLEU", "VERT", "ROSE", "GRIS", "JAUNE",
        "MARRON", "BEIGE", "VIOLET", "ORANGE", "TURQUOISE", "KAKI", "IVOIRE",
        "WHITE", "BLACK", "RED", "BLUE", "GREEN", "PINK", "GREY", "GRAY",
        "YELLOW", "BROWN", "PURPLE", "SILVER", "GOLD", "NAVY", "CREAM",
    }
    sizes: list[str] = []
    colors: list[str] = []

    for v in variants:
        v_clean = v.strip()
        if not v_clean:
            continue
        # Known color words (even short ones) → color
        if v_clean.upper() in _COLOR_WORDS:
            colors.append(v_clean)
        # Exact size token match (numeric or alpha size)
        elif v_clean.upper() in _SIZE_SET:
            sizes.append(v_clean)
        # Short uppercase alphanumeric that's NOT a known color → size
        elif re.fullmatch(r"[A-Z0-9 ]{1,6}", v_clean) and len(v_clean) <= 6:
            sizes.append(v_clean)
        else:
            colors.append(v_clean)

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
                    # Sizes are short tokens, not long descriptions
                    if txt and len(txt) <= 6 and txt.upper() in _SIZE_SET:
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
    return {"status": "ok"}


@app.get("/analyze")
async def analyze(url: str = Query(min_length=1)):
    """Scrape a product URL and return metadata.

    All scraping runs via asyncio.to_thread to keep Playwright
    out of the uvicorn event loop and avoid asyncio conflicts.
    """
    import asyncio as _asyncio

    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            raise HTTPException(status_code=400, detail="Invalid URL scheme")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid URL")

    html: str | None = None
    page = None

    # Level 1 — plain HTTP
    try:
        page = await _asyncio.to_thread(Fetcher.get, url, stealthy_headers=True, timeout=15)
        if getattr(page, "status", 0) in (200, 304):
            html = getattr(page, "html_content", "")
            if html and len(html) < 5000:
                logger.debug("Level 1 HTML too small (%d bytes) — escalating", len(html))
                html = None
    except Exception:
        logger.debug("Level 1 (Fetcher) failed", exc_info=True)

    # Level 2 — Playwright stealth
    if html is None:
        try:
            page = await _asyncio.to_thread(
                PlayWrightFetcher.fetch,
                url,
                headless=True,
                stealth=True,
                disable_resources=True,
                timeout=25000,
                wait=2000,
            )
            html = getattr(page, "html_content", "")
        except Exception:
            logger.debug("Level 2 (PlayWrightFetcher) failed", exc_info=True)

    # Level 3 — Playwright best effort
    if html is None:
        try:
            page = await _asyncio.to_thread(
                PlayWrightFetcher.fetch,
                url,
                headless=True,
                stealth=True,
                timeout=30000,
                wait=3000,
            )
            html = getattr(page, "html_content", "")
        except Exception:
            logger.debug("Level 3 (PlayWrightFetcher) failed", exc_info=True)

    if not html:
        raise HTTPException(status_code=502, detail="All fetch levels failed")

    # --- Extraction: try og:meta first (works for most retailers), fall back to CSS ---
    name = _pick_meta(html, "og:title")
    if not name:
        name = _extract_title(html)
    if not name and page is not None:
        name = _extract_css_text(page, "h1")

    image_url = _pick_meta(html, "og:image")
    if not image_url and page is not None:
        image_url = _extract_css_image(page, url)

    price = _pick_price(html)
    if price is None and page is not None:
        price = _extract_css_price(page)

    variants = _extract_variants(html)

    # Extract sizes and colors from rendered page (JS-rendered selectors)
    if page is not None:
        css_sizes = _extract_css_sizes(page)
        for s in css_sizes:
            if s not in variants:
                variants.append(s)
        css_colors = _extract_css_colors(page)
        for c in css_colors:
            if c not in variants:
                variants.append(c)

    # Split into sizes and colors for multi-select UI
    sizes, colors = _classify_variants(variants)

    return {
        "ok": True,
        "url": url,
        "name": name,
        "image_url": image_url,
        "price": price,
        "variants": variants,   # legacy — full merged list
        "sizes": sizes,
        "colors": colors,
    }
