"""3-level fallback fetcher.

Level 1: Fetcher.get()         — plain HTTP with stealthy headers  (method: "http")
Level 2: StealthyFetcher.fetch() — headless Camoufox browser       (method: "stealth")
Level 3: PlayWrightFetcher.fetch(stealth=True) — Playwright stealth (method: "playwright_stealth")

Returns (page, method) where page is a Scrapling Response/Adaptor object.
Raises the last exception if all three levels fail.
"""

from scrapling.fetchers import Fetcher, PlayWrightFetcher, StealthyFetcher


def fetch_with_fallback(url: str) -> tuple:
    """Fetch *url* with a 3-level fallback strategy.

    Returns:
        (page, method) — page is the Scrapling Response object;
        method is one of "http", "stealth", "playwright_stealth".

    Raises:
        The last exception raised if every level fails.
    """
    last_exc: Exception | None = None

    # ------------------------------------------------------------------
    # Level 1 — plain HTTP (Fetcher.get has retries=3 built-in)
    # ------------------------------------------------------------------
    try:
        page = Fetcher.get(url, stealthy_headers=True)
        if page.status in (200, 304):
            return page, "http"
        # Non-success status — fall through to level 2
    except Exception as exc:
        last_exc = exc

    # ------------------------------------------------------------------
    # Level 2 — headless Camoufox (StealthyFetcher)
    # ------------------------------------------------------------------
    try:
        page = StealthyFetcher.fetch(url, headless=True, disable_resources=True)
        if page.status == 200:
            return page, "stealth"
        # Non-200 — fall through to level 3
    except Exception as exc:
        last_exc = exc

    # ------------------------------------------------------------------
    # Level 3 — Playwright with stealth (best effort, return whatever we get)
    # ------------------------------------------------------------------
    try:
        page = PlayWrightFetcher.fetch(url, stealth=True, disable_resources=True)
        return page, "playwright_stealth"
    except Exception as exc:
        last_exc = exc

    # All three levels failed
    raise last_exc  # type: ignore[misc]
