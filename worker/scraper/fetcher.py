"""3-level fallback fetcher.

Level 1: Fetcher.get()           — plain HTTP with stealthy headers  (method: "http")
Level 2: PlayWrightFetcher.fetch  — Playwright with stealth mode     (method: "playwright_stealth")
Level 3: PlayWrightFetcher.fetch  — Playwright, best effort          (method: "playwright_stealth")

Returns (page, method) where page is a Scrapling Response/Adaptor object.
Raises the last exception if all levels fail.
"""

from scrapling.fetchers import Fetcher, PlayWrightFetcher


def fetch_with_fallback(url: str) -> tuple:
    """Fetch *url* with a 3-level fallback strategy.

    Returns:
        (page, method) — page is the Scrapling Response object;
        method is one of "http", "playwright_stealth".

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
            html = getattr(page, "html_content", "")
            # Bot challenge detection: tiny HTML pages are JS redirects
            # (Akamai, Cloudflare, etc.) — escalate to Playwright.
            if html and len(html) < 5000:
                last_exc = RuntimeError("Bot challenge detected (< 5 KB HTML)")
            else:
                return page, "http"
    except Exception as exc:
        last_exc = exc

    # ------------------------------------------------------------------
    # Level 2 — Playwright with stealth + disabled resources (faster)
    # ------------------------------------------------------------------
    try:
        page = PlayWrightFetcher.fetch(url, stealth=True, disable_resources=True)
        if page.status == 200:
            return page, "playwright_stealth"
    except Exception as exc:
        last_exc = exc

    # ------------------------------------------------------------------
    # Level 3 — Playwright, best effort (return whatever we get)
    # ------------------------------------------------------------------
    try:
        page = PlayWrightFetcher.fetch(url, stealth=True)
        return page, "playwright_stealth"
    except Exception as exc:
        last_exc = exc

    # All three levels failed
    raise last_exc  # type: ignore[misc]
