"""Zara product stock parser.

Zara pages embed stock data in a ``window.__NEXT_DATA__`` JSON blob.
Path: props.pageProps.product.detail.colors[].sizes[].availability
Availability values: "in_stock" | "low_stock" | "out_of_stock"
"""

import json
import re

# Regex to extract the JSON string assigned to __NEXT_DATA__ in a raw HTML blob.
# The script tag looks like:
#   <script id="__NEXT_DATA__" type="application/json">{"props": ...}</script>
# We also try a bare assignment form just in case a minified bundle uses it.
_RE_NEXT_DATA_ASSIGN = re.compile(
    r"window\.__NEXT_DATA__\s*=\s*(\{.*?\})\s*;",
    re.DOTALL,
)

# Zara availability strings → canonical status
_AVAILABILITY_MAP: dict[str, str] = {
    "in_stock": "IN_STOCK",
    "low_stock": "IN_STOCK",   # low stock = still purchasable
    "out_of_stock": "OUT_OF_STOCK",
}


def parse_zara(
    page,
    variant_label: str | None,
    variant_id: str | None,
) -> tuple[str, str | None]:
    """Parse a Zara product page for stock status.

    Extracts ``window.__NEXT_DATA__`` JSON from the page HTML and navigates to
    ``props.pageProps.product.detail.colors[].sizes[].availability``.

    Args:
        page:          Scrapling Response/Adaptor object for the fetched page.
        variant_label: Human-readable size/colour label, e.g. ``"S"`` or
                       ``"S / Noir"``.  Case-insensitive matching.
        variant_id:    Retailer SKU/ID for the specific variant (optional).

    Returns:
        ``(status, signal_source)`` in the same format as ``detect_stock``:

        - *status*:        ``"IN_STOCK"`` | ``"OUT_OF_STOCK"`` | ``"UNKNOWN"``
        - *signal_source*: ``"dataLayer"`` when a conclusive answer was found,
                           ``None`` when returning ``"UNKNOWN"``.
    """
    data = _extract_next_data(page)
    if data is None:
        return "UNKNOWN", None

    colors = _get_colors(data)
    if colors is None:
        return "UNKNOWN", None

    if variant_label or variant_id:
        status = _find_variant_status(colors, variant_label, variant_id)
    else:
        status = _any_size_in_stock(colors)

    if status is None:
        return "UNKNOWN", None

    return status, "dataLayer"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_next_data(page) -> dict | None:
    """Return the parsed __NEXT_DATA__ JSON object, or None on failure."""
    # Preferred path: <script id="__NEXT_DATA__" type="application/json">
    script_elements = page.css('script#__NEXT_DATA__')
    for el in script_elements:
        text = el.get_all_text()
        if text:
            data = _try_parse(text)
            if data is not None:
                return data
        # Fallback: grab the raw html_content and strip the outer <script> tags
        raw = el.html_content or ""
        if raw:
            # Strip surrounding <script ...> and </script>
            inner = re.sub(r"<script[^>]*>", "", raw, count=1, flags=re.IGNORECASE)
            inner = re.sub(r"</script>", "", inner, flags=re.IGNORECASE)
            data = _try_parse(inner.strip())
            if data is not None:
                return data

    # Secondary path: search all scripts for the assignment form
    all_scripts = page.css("script")
    for el in all_scripts:
        html = el.html_content or ""
        if "__NEXT_DATA__" not in html:
            continue
        match = _RE_NEXT_DATA_ASSIGN.search(html)
        if match:
            data = _try_parse(match.group(1))
            if data is not None:
                return data

    return None


def _get_colors(data: dict) -> list | None:
    """Navigate props.pageProps.product.detail.colors, return list or None."""
    try:
        colors = data["props"]["pageProps"]["product"]["detail"]["colors"]
        if isinstance(colors, list):
            return colors
    except (KeyError, TypeError):
        pass
    return None


def _find_variant_status(
    colors: list,
    variant_label: str | None,
    variant_id: str | None,
) -> str | None:
    """Search all colors/sizes for the target variant and return its status."""
    label_norm = variant_label.strip().lower() if variant_label else None
    id_norm = variant_id.strip().lower() if variant_id else None

    for color in colors:
        if not isinstance(color, dict):
            continue
        sizes = color.get("sizes") or []
        for size in sizes:
            if not isinstance(size, dict):
                continue
            if _size_matches(size, label_norm, id_norm):
                availability = size.get("availability", "")
                status = _AVAILABILITY_MAP.get(availability.lower() if availability else "")
                # Return the status even if unknown value — lets caller see it
                if status is not None:
                    return status
                # availability key present but unrecognised value — keep looking
    return None


def _any_size_in_stock(colors: list) -> str | None:
    """Return IN_STOCK if any size across all colors is available, else OUT_OF_STOCK."""
    found_any = False
    for color in colors:
        if not isinstance(color, dict):
            continue
        sizes = color.get("sizes") or []
        for size in sizes:
            if not isinstance(size, dict):
                continue
            availability = size.get("availability", "")
            status = _AVAILABILITY_MAP.get(availability.lower() if availability else "")
            if status is None:
                continue
            found_any = True
            if status == "IN_STOCK":
                return "IN_STOCK"
    # If we found availability info but nothing was in stock
    if found_any:
        return "OUT_OF_STOCK"
    return None


def _size_matches(
    size: dict,
    label_norm: str | None,
    id_norm: str | None,
) -> bool:
    """Return True if the size entry corresponds to the target variant."""
    # Match by name field (case-insensitive)
    if label_norm:
        name = size.get("name") or size.get("label") or ""
        if isinstance(name, str) and name.strip().lower() == label_norm:
            return True

    # Match by sku contains variant_id, or sku equals variant_id
    if id_norm:
        sku = size.get("sku") or size.get("id") or ""
        if isinstance(sku, str) and id_norm in sku.strip().lower():
            return True

    return False


def _try_parse(text: str) -> dict | None:
    """Attempt JSON parsing; return dict or None on failure."""
    try:
        obj = json.loads(text)
        if isinstance(obj, dict):
            return obj
    except (json.JSONDecodeError, ValueError):
        pass
    return None
