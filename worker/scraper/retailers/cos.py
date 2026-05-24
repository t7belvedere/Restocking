"""COS product stock parser.

COS (H&M Group) exposes an internal stock API:
  GET https://www.cos.com/api/product/{PRODUCT_ID}/availability
  Response: {"sizes": [{"label": "S", "available": true}, ...]}

The product ID is extracted from the product page URL or, as a fallback,
from a pattern in the raw HTML.
"""

import re

import httpx

# COS product URLs typically look like:
#   https://www.cos.com/en_eur/women/womenswear/tops/product.slim-fit-blouse.1261840001.html
#   https://www.cos.com/en_gbp/.../-p1261840001.html
#   https://www.cos.com/...1261840001.html
#
# The numeric product ID (7–10 digits) appears as:
#   - the last numeric segment before ".html"  →  …product.name.1234567890.html
#   - after a literal "-p" or ".p"             →  …-p1234567890.html
_RE_URL_PRODUCT_ID = re.compile(
    r"(?:[/.-]p?)(\d{7,12})(?:\.html|/|$)",
    re.IGNORECASE,
)

# Fallback: product ID embedded in script/data attributes in the HTML
# e.g. "productId":"1261840001" or data-product-id="1261840001"
_RE_HTML_PRODUCT_ID = re.compile(
    r'(?:productId["\']?\s*[=:]\s*["\']?|data-product-id=["\'])(\d{7,12})',
    re.IGNORECASE,
)

_API_BASE = "https://www.cos.com/api/product/{product_id}/availability"
_API_TIMEOUT = 10  # seconds


def parse_cos(
    page,
    variant_label: str | None,
    variant_id: str | None,
    url: str = "",
) -> tuple[str, str | None]:
    """Parse COS product page for stock status.

    Strategy:
    1. Extract product ID from the original URL (or HTML fallback).
    2. Call the COS stock API.
    3. Match variant_label against size labels (case-insensitive).
    4. Return stock status.

    Args:
        page:          Scrapling Response/Adaptor object for the fetched page.
        variant_label: Human-readable size label, e.g. ``"S"`` or ``"XL"``.
                       Case-insensitive matching.
        variant_id:    Retailer SKU/ID for the specific variant (optional,
                       not used by this parser — COS API uses size labels).
        url:           Original product URL (preferred source for the product ID).

    Returns:
        ``(status, signal_source)``:

        - *status*:        ``"IN_STOCK"`` | ``"OUT_OF_STOCK"`` | ``"UNKNOWN"``
        - *signal_source*: ``"dataLayer"`` on success, ``None`` on failure.
    """
    product_id = _extract_product_id(url, page)
    if product_id is None:
        return "UNKNOWN", None

    sizes = _fetch_availability(product_id)
    if sizes is None:
        return "UNKNOWN", None

    if variant_label:
        status = _find_size_status(sizes, variant_label)
    else:
        status = _any_size_available(sizes)

    if status is None:
        return "UNKNOWN", None

    return status, "dataLayer"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_product_id(url: str, page) -> str | None:
    """Return the COS product ID string, or None if it cannot be determined."""
    # 1. Try the provided URL first (cheapest, most reliable)
    if url:
        match = _RE_URL_PRODUCT_ID.search(url)
        if match:
            return match.group(1)

    # 2. Try page.url if the Scrapling version exposes it
    page_url = getattr(page, "url", None)
    if page_url and isinstance(page_url, str):
        match = _RE_URL_PRODUCT_ID.search(page_url)
        if match:
            return match.group(1)

    # 3. Search the raw HTML for embedded product ID patterns
    html = getattr(page, "html_content", None) or ""
    if html:
        match = _RE_HTML_PRODUCT_ID.search(html)
        if match:
            return match.group(1)

    return None


def _fetch_availability(product_id: str) -> list | None:
    """Call the COS stock API and return the ``sizes`` list, or None on error."""
    api_url = _API_BASE.format(product_id=product_id)
    try:
        response = httpx.get(api_url, timeout=_API_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        if isinstance(data, dict):
            sizes = data.get("sizes")
            if isinstance(sizes, list):
                return sizes
    except Exception:
        # Network errors, non-200 responses, JSON parse errors — all → UNKNOWN
        pass
    return None


def _find_size_status(sizes: list, variant_label: str) -> str | None:
    """Return ``IN_STOCK`` or ``OUT_OF_STOCK`` for the matching size, or None."""
    label_norm = variant_label.strip().lower()
    for entry in sizes:
        if not isinstance(entry, dict):
            continue
        label = entry.get("label") or entry.get("name") or ""
        if isinstance(label, str) and label.strip().lower() == label_norm:
            available = entry.get("available")
            if available is True:
                return "IN_STOCK"
            if available is False:
                return "OUT_OF_STOCK"
            # Key missing or unexpected type — cannot determine
    return None


def _any_size_available(sizes: list) -> str | None:
    """Return IN_STOCK if any size is available, OUT_OF_STOCK if none are, None if no valid data."""
    found_valid_entry = False
    for entry in sizes:
        if not isinstance(entry, dict):
            continue
        available = entry.get("available")
        if available is True:
            return "IN_STOCK"
        if available is False:
            found_valid_entry = True
    return "OUT_OF_STOCK" if found_valid_entry else None
