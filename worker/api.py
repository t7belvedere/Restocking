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
    """
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            raise HTTPException(status_code=400, detail="Invalid URL scheme")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid URL")

    html: str | None = None

    # Level 1 — plain HTTP
    try:
        page = Fetcher.get(url, stealthy_headers=True, timeout=15)
        if page.status in (200, 304):
            html = getattr(page, "html_content", "")
    except Exception:
        logger.debug("Level 1 (Fetcher) failed", exc_info=True)

    # Level 2 — headless Camoufox
    if html is None:
        try:
            page = StealthyFetcher.fetch(url, headless=True, disable_resources=True, timeout=20000)
            if page.status == 200:
                html = getattr(page, "html_content", "")
        except Exception:
            logger.debug("Level 2 (StealthyFetcher) failed", exc_info=True)

    # Level 3 — Playwright stealth
    if html is None:
        try:
            page = PlayWrightFetcher.fetch(url, stealth=True, disable_resources=True, timeout=30000)
            html = getattr(page, "html_content", "")
        except Exception:
            logger.debug("Level 3 (PlayWrightFetcher) failed", exc_info=True)

    if not html:
        raise HTTPException(status_code=502, detail="All fetch levels failed")

    name = _pick_meta(html, "og:title")
    image_url = _pick_meta(html, "og:image")
    price = _pick_price(html)
    variants = _extract_variants(html)

    return {
        "ok": True,
        "url": url,
        "name": name,
        "image_url": image_url,
        "price": price,
        "variants": variants,
    }
