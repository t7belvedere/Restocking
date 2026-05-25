"""3-level fallback fetcher.

Level 1: Fetcher.get()           — plain HTTP with stealthy headers  (method: "http")
Level 2: PlayWrightFetcher.fetch  — Playwright with stealth mode     (method: "playwright_stealth")
Level 3: PlayWrightFetcher.fetch  — Playwright, best effort          (method: "playwright_stealth")

Proxy (IPRoyal residential) is only used when use_proxy=True (Pro plan, last resort).

Returns (page, method) where page is a Scrapling Response/Adaptor object.
Raises the last exception if all levels fail.
"""

import os
from urllib.parse import urlparse as _urlparse

from scrapling.fetchers import Fetcher, PlayWrightFetcher

_proxy_url = os.getenv("PROXY_URL")

# For Playwright, proxy must be a dict {server, username, password}
_pw_proxy: dict | None = None
if _proxy_url:
    try:
        _p = _urlparse(_proxy_url)
        _pw_proxy = {"server": f"{_p.scheme}://{_p.hostname}:{_p.port or 80}"}
        if _p.username:
            _pw_proxy["username"] = _p.username
        if _p.password:
            _pw_proxy["password"] = _p.password
    except Exception:
        pass


def _pw_kwargs(use_proxy: bool = False, **overrides):
    """Base Playwright kwargs. Proxy only when use_proxy=True (Pro plan)."""
    kw = {
        "headless": True,
        "stealth": True,
        "hide_canvas": True,
        "disable_resources": True,
    }
    kw.update(overrides)
    if use_proxy and _pw_proxy:
        kw["proxy"] = _pw_proxy
    return kw


def _http_kwargs(use_proxy: bool = False, **overrides):
    """Base HTTP kwargs. Proxy only when use_proxy=True (Pro plan)."""
    kw = {"stealthy_headers": True}
    kw.update(overrides)
    if use_proxy and _proxy_url:
        kw["proxy"] = _proxy_url
    return kw


def fetch_with_fallback(url: str, use_proxy: bool = False) -> tuple:
    """Fetch *url* with a 3-level fallback strategy.

    Proxy is reserved for Pro users as a last resort.
    Free users: HTTP → Playwright → Playwright best-effort (no proxy).

    Returns:
        (page, method) — page is the Scrapling Response object;
        method is one of "http", "playwright_stealth".

    Raises:
        The last exception raised if every level fails.
    """
    last_exc: Exception | None = None

    # Level 1 — plain HTTP
    try:
        page = Fetcher.get(url, **_http_kwargs())
        if page.status in (200, 304):
            html = getattr(page, "html_content", "")
            if html and len(html) < 5000:
                last_exc = RuntimeError("Bot challenge detected (< 5 KB HTML)")
            else:
                return page, "http"
    except Exception as exc:
        last_exc = exc

    # Level 2 — Playwright with stealth + disabled resources
    try:
        page = PlayWrightFetcher.fetch(url, **_pw_kwargs())
        if page.status == 200:
            return page, "playwright_stealth"
    except Exception as exc:
        last_exc = exc

    # Level 3 — Playwright, best effort
    try:
        page = PlayWrightFetcher.fetch(url, **_pw_kwargs(disable_resources=False))
        return page, "playwright_stealth"
    except Exception as exc:
        last_exc = exc

    # Level 4 — Pro only: Playwright + proxy (last resort)
    if use_proxy and (_proxy_url or _pw_proxy):
        try:
            page = PlayWrightFetcher.fetch(url, **_pw_kwargs(use_proxy=True, disable_resources=True))
            if page.status == 200:
                return page, "playwright_proxy"
        except Exception as exc:
            last_exc = exc

        try:
            page = PlayWrightFetcher.fetch(url, **_pw_kwargs(use_proxy=True, disable_resources=False))
            return page, "playwright_proxy"
        except Exception as exc:
            last_exc = exc

    raise last_exc  # type: ignore[misc]
