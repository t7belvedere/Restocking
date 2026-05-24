"""Stock detection strategies for scraped pages.

Strategies are applied in order — first match wins:
  1. dataLayer / digitalData JSON  → signal_source = "dataLayer"
  2. Add-to-cart button state      → signal_source = "add_to_cart_btn"
  3. Variant/size element attrs    → signal_source = "variant_attr"
  4. Text keyword fallback         → signal_source = None
"""

import json
import re


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def detect_stock(
    page,
    variant_label: str | None,
    variant_id: str | None,
) -> tuple[str, str | None]:
    """Detect stock status from a scraped page.

    Returns:
        (status, signal_source) where:
        - status is one of: "IN_STOCK", "OUT_OF_STOCK", "UNKNOWN"
        - signal_source is one of: "dataLayer", "add_to_cart_btn", "variant_attr", None
          (None when falling back to text keywords or when completely unknown)
    """
    result = _strategy_data_layer(page, variant_label, variant_id)
    if result is not None:
        return result, "dataLayer"

    result = _strategy_add_to_cart(page)
    if result is not None:
        return result, "add_to_cart_btn"

    if variant_label or variant_id:
        result = _strategy_variant_attr(page, variant_label, variant_id)
        if result is not None:
            return result, "variant_attr"

    result = _strategy_text_keywords(page)
    return result, None


# ---------------------------------------------------------------------------
# Strategy 1 — dataLayer / digitalData JSON
# ---------------------------------------------------------------------------

# Regexes to extract JS array/object assignments from inline <script> blocks
_RE_DATA_LAYER = re.compile(
    r"window\.dataLayer\s*=\s*(\[.*?\])",
    re.DOTALL,
)
_RE_DIGITAL_DATA = re.compile(
    r"window\.digitalData\s*=\s*(\{.*?\})",
    re.DOTALL,
)
# Also handle push()-style additions: dataLayer.push({...})
_RE_DATA_LAYER_PUSH = re.compile(
    r"dataLayer\.push\s*\(\s*(\{.*?\})\s*\)",
    re.DOTALL,
)

# Normalised values → status
_AVAILABILITY_MAP: dict[str, str] = {
    # in stock variants
    "instock": "IN_STOCK",
    "in stock": "IN_STOCK",
    "in_stock": "IN_STOCK",
    "https://schema.org/instock": "IN_STOCK",
    "available": "IN_STOCK",
    # out-of-stock variants
    "outofstock": "OUT_OF_STOCK",
    "out of stock": "OUT_OF_STOCK",
    "out_of_stock": "OUT_OF_STOCK",
    "https://schema.org/outofstock": "OUT_OF_STOCK",
    "soldout": "OUT_OF_STOCK",
    "sold out": "OUT_OF_STOCK",
    "sold_out": "OUT_OF_STOCK",
    "unavailable": "OUT_OF_STOCK",
}

_STOCK_KEY_MAP: dict[str, dict[str, str]] = {
    # key: {raw_value_normalised: status}
    "stock": {
        "instock": "IN_STOCK",
        "in_stock": "IN_STOCK",
        "outofstock": "OUT_OF_STOCK",
        "out_of_stock": "OUT_OF_STOCK",
    },
    "stockstatus": {
        "instock": "IN_STOCK",
        "in_stock": "IN_STOCK",
        "outofstock": "OUT_OF_STOCK",
        "out_of_stock": "OUT_OF_STOCK",
    },
}


def _normalise(value: str) -> str:
    return value.strip().lower()


def _status_from_value(key: str, raw_value) -> str | None:
    """Map a known key + raw value to IN_STOCK / OUT_OF_STOCK, or None."""
    if not isinstance(raw_value, str):
        return None
    norm = _normalise(raw_value)
    if key in ("availability",):
        return _AVAILABILITY_MAP.get(norm)
    if key in _STOCK_KEY_MAP:
        return _STOCK_KEY_MAP[key].get(norm)
    return None


def _search_dict(obj, variant_label: str | None, variant_id: str | None) -> str | None:
    """Recursively search a parsed JSON object for stock keys.

    If a variant is specified, try to match by label/id first before falling
    back to top-level keys — avoids returning a different size's status.
    """
    if not isinstance(obj, (dict, list)):
        return None

    if isinstance(obj, list):
        # If variant is specified, look for a matching entry first
        if variant_label or variant_id:
            for item in obj:
                if isinstance(item, dict) and _item_matches_variant(item, variant_label, variant_id):
                    status = _extract_stock_from_dict(item)
                    if status:
                        return status
        # Recurse into every item regardless
        for item in obj:
            status = _search_dict(item, variant_label, variant_id)
            if status:
                return status
        return None

    # It's a dict — try direct keys first
    status = _extract_stock_from_dict(obj)
    if status:
        return status

    # Recurse into nested values
    for v in obj.values():
        status = _search_dict(v, variant_label, variant_id)
        if status:
            return status
    return None


def _item_matches_variant(item: dict, variant_label: str | None, variant_id: str | None) -> bool:
    """Return True if this dict entry looks like it corresponds to the target variant."""
    candidate_keys = ("size", "label", "name", "id", "sku", "variantId", "variant_id")
    for k in candidate_keys:
        val = item.get(k)
        if val is None:
            continue
        val_str = str(val).strip().lower()
        if variant_label and val_str == variant_label.strip().lower():
            return True
        if variant_id and val_str == variant_id.strip().lower():
            return True
    return False


def _extract_stock_from_dict(item: dict) -> str | None:
    """Check a flat dict for known stock keys and return a status if found."""
    for key in ("availability", "stock", "stockStatus", "stockstatus"):
        raw = item.get(key)
        if raw is not None:
            status = _status_from_value(key.lower(), raw)
            if status:
                return status
    return None


def _try_parse_json(text: str) -> object | None:
    """Attempt to parse a JSON string; return None on failure."""
    try:
        return json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return None


def _strategy_data_layer(
    page,
    variant_label: str | None,
    variant_id: str | None,
) -> str | None:
    """Strategy 1: parse dataLayer / digitalData from inline <script> tags."""
    script_tags = page.css("script")
    for script in script_tags:
        html = script.html_content or ""
        if not html:
            continue

        # window.dataLayer = [...]
        for match in _RE_DATA_LAYER.finditer(html):
            obj = _try_parse_json(match.group(1))
            if obj is not None:
                status = _search_dict(obj, variant_label, variant_id)
                if status:
                    return status

        # dataLayer.push({...})
        for match in _RE_DATA_LAYER_PUSH.finditer(html):
            obj = _try_parse_json(match.group(1))
            if obj is not None:
                status = _search_dict(obj, variant_label, variant_id)
                if status:
                    return status

        # window.digitalData = {...}
        for match in _RE_DIGITAL_DATA.finditer(html):
            obj = _try_parse_json(match.group(1))
            if obj is not None:
                status = _search_dict(obj, variant_label, variant_id)
                if status:
                    return status

    return None


# ---------------------------------------------------------------------------
# Strategy 2 — Add-to-cart button state
# ---------------------------------------------------------------------------

_ADD_TO_CART_SELECTORS = [
    'button[data-action="add-to-bag"]',
    "button[data-add-to-cart]",
    'button[type="submit"][name*="cart"]',
    'button[type="submit"][name*="bag"]',
    "button.add-to-cart",
    "button.add_to_cart",
]

_DISABLED_CLASS_FRAGMENTS = frozenset(
    ["disabled", "out-of-stock", "out_of_stock", "sold-out", "sold_out"]
)


def _has_disabled_class(element) -> bool:
    """Return True if the element's class attribute contains a disabled-style token."""
    cls = element.attrib.get("class", "") or ""
    cls_lower = cls.lower()
    return any(fragment in cls_lower for fragment in _DISABLED_CLASS_FRAGMENTS)


def _strategy_add_to_cart(page) -> str | None:
    """Strategy 2: infer stock from add-to-cart button state."""
    for selector in _ADD_TO_CART_SELECTORS:
        elements = page.css(selector)
        if not elements:
            continue

        btn = elements[0]
        disabled_attr = btn.attrib.get("disabled")
        if disabled_attr is not None or _has_disabled_class(btn):
            return "OUT_OF_STOCK"

        # Button found and NOT disabled → product is purchasable
        return "IN_STOCK"

    return None


# ---------------------------------------------------------------------------
# Strategy 3 — Variant / size element attributes
# ---------------------------------------------------------------------------

_VARIANT_SELECTORS = [
    "li[data-size]",
    "li[data-value]",
    '[class*="size"]',
    '[class*="variant"]',
    "option",
]

_UNAVAILABLE_CLASS_FRAGMENTS = frozenset(
    ["unavailable", "disabled", "out-of-stock", "out_of_stock", "sold-out", "sold_out"]
)


def _element_matches_variant(element, variant_label: str | None, variant_id: str | None) -> bool:
    """Check whether this element corresponds to the target variant."""
    # Check data attributes
    for attr_key in ("data-size", "data-value", "data-id", "value"):
        attr_val = element.attrib.get(attr_key)
        if attr_val:
            attr_norm = attr_val.strip().lower()
            if variant_label and attr_norm == variant_label.strip().lower():
                return True
            if variant_id and attr_norm == variant_id.strip().lower():
                return True

    # Check text content
    text = str(element.get_all_text()).strip().lower()
    if variant_label and text == variant_label.strip().lower():
        return True
    if variant_id and text == variant_id.strip().lower():
        return True

    return False


def _element_is_unavailable(element) -> bool:
    """Return True if element signals unavailability via attributes or classes."""
    # data-available="false"
    available_attr = element.attrib.get("data-available", "")
    if available_attr and available_attr.strip().lower() == "false":
        return True

    cls = element.attrib.get("class", "") or ""
    cls_lower = cls.lower()
    return any(fragment in cls_lower for fragment in _UNAVAILABLE_CLASS_FRAGMENTS)


def _strategy_variant_attr(
    page,
    variant_label: str | None,
    variant_id: str | None,
) -> str | None:
    """Strategy 3: check variant/size element attributes for the target variant."""
    for selector in _VARIANT_SELECTORS:
        elements = page.css(selector)
        if not elements:
            continue

        for element in elements:
            if not _element_matches_variant(element, variant_label, variant_id):
                continue
            if _element_is_unavailable(element):
                return "OUT_OF_STOCK"
            # Matched and no unavailability signal → assume in stock
            return "IN_STOCK"

    return None


# ---------------------------------------------------------------------------
# Strategy 4 — Text keyword fallback
# ---------------------------------------------------------------------------

_OUT_OF_STOCK_KEYWORDS = [
    "rupture de stock",
    "out of stock",
    "sold out",
    "épuisé",
    "épuisée",
    "indisponible",
    "currently unavailable",
    "hors stock",
]

_IN_STOCK_KEYWORDS = [
    "ajouter au panier",
    "add to cart",
    "add to bag",
    "en stock",
    "in stock",
    "available",
]


def _strategy_text_keywords(page) -> str:
    """Strategy 4: keyword scan of visible page text.  Always returns a status string."""
    text = str(page.get_all_text()).lower()

    # Check out-of-stock first (more specific / higher confidence)
    for kw in _OUT_OF_STOCK_KEYWORDS:
        if kw in text:
            return "OUT_OF_STOCK"

    for kw in _IN_STOCK_KEYWORDS:
        if kw in text:
            return "IN_STOCK"

    return "UNKNOWN"
