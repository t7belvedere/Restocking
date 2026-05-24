"""FastAPI app — exposes /analyze so the frontend can delegate scraping to the worker."""

import logging
import re
from urllib.parse import urlparse

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from scrapling.fetchers import Fetcher, PlayWrightFetcher, StealthyFetcher
from scrapling.parser import Adaptor

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
    m = re.search(
        rf'<meta[^>]+(?:property|name)=["\']{prop}["\'][^>]+content=["\']([^"\']+)["\']',
        html,
        re.IGNORECASE,
    )
    return m.group(1) if m else None


def _pick_price(html: str) -> float | None:
    for key in ("og:price:amount", "product:price:amount", "price"):
        raw = _pick_meta(html, key)
        if raw:
            try:
                return float(raw.replace(",", "."))
            except (ValueError, TypeError):
                pass
    m = re.search(r"(\d{1,4}(?:[.,]\d{2})?)\s*€", html)
    if m:
        try:
            return float(m.group(1).replace(",", "."))
        except (ValueError, TypeError):
            pass
    return None


def _extract_variants(html: str) -> list[str]:
    found: set[str] = set()
    for token in SIZE_TOKENS:
        if re.search(
            rf'(?:>\s*{re.escape(token)}\s*<|data-size=["\']{re.escape(token)}["\']|aria-label=["\'][^"\']*{re.escape(token)}[^"\']*["\'])',
            html,
        ):
            found.add(token)
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


def _extract_css_image(page) -> str | None:
    """Extract the main product image from a rendered page.

    Takes the first large-looking image, skipping transparent placeholders
    and tiny icons. Falls back to og:image in HTML.
    """
    try:
        imgs = page.css("img")
        for img in imgs[:30]:
            src = img.attrib.get("src") or img.attrib.get("data-src") or ""
            if not src or "transparent" in src.lower():
                continue
            if len(src) > 20:
                return src
    except Exception:
        pass
    # Fallback: search raw HTML for og:image
    html = getattr(page, "html_content", "")
    m = re.search(
        r'(?:property|name)=["\']og:image["\'][^>]+content=["\']([^"\']+)',
        html,
        re.IGNORECASE,
    )
    return m.group(1) if m else None


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

    Uses the same 3-tier fallback as the main worker loop:
    Fetcher → StealthyFetcher → PlayWrightFetcher.
    All async — FastAPI runs inside an asyncio event loop.
    """
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            raise HTTPException(status_code=400, detail="Invalid URL scheme")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid URL")

    html: str | None = None
    page = None  # keep reference to the last successful page for CSS selectors

    # Level 1 — plain HTTP (async)
    try:
        page = await Fetcher.async_get(url, stealthy_headers=True, timeout=15)
        if page.status in (200, 304):
            html = getattr(page, "html_content", "")
            # Bot challenge detection: tiny HTML = JS redirect page (Akamai, Cloudflare, etc.)
            if html and len(html) < 5000:
                logger.debug("Level 1 HTML too small (%d bytes) — likely bot challenge, escalating", len(html))
                html = None
    except Exception:
        logger.debug("Level 1 (Fetcher.async_get) failed", exc_info=True)

    # Level 2 — headless Camoufox (async)
    if html is None:
        try:
            page = await StealthyFetcher.async_fetch(url, headless=True, disable_resources=True, timeout=20000)
            if page.status == 200:
                html = getattr(page, "html_content", "")
        except Exception:
            logger.debug("Level 2 (StealthyFetcher.async_fetch) failed", exc_info=True)

    # Level 3 — Playwright stealth with JS rendering (async)
    if html is None:
        try:
            page = await PlayWrightFetcher.async_fetch(url, stealth=True, disable_resources=True, timeout=30000, wait=2000)
            html = getattr(page, "html_content", "")
        except Exception:
            logger.debug("Level 3 (PlayWrightFetcher.async_fetch) failed", exc_info=True)

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
        image_url = _extract_css_image(page)

    price = _pick_price(html)
    if price is None and page is not None:
        price = _extract_css_price(page)

    variants = _extract_variants(html)

    return {
        "ok": True,
        "url": url,
        "name": name,
        "image_url": image_url,
        "price": price,
        "variants": variants,
    }
