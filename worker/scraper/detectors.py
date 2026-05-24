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

    # Variant-specific check BEFORE generic add-to-cart button
    # (variant_attr can detect OOS for a specific size even when the
    #  product-level add-to-cart button is still enabled for other sizes)
    if variant_label or variant_id:
        result = _strategy_variant_attr(page, variant_label, variant_id)
        if result is not None:
            return result, "variant_attr"

    result = _strategy_add_to_cart(page)
    if result is not None:
        return result, "add_to_cart_btn"

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

    When a variant is specified, variant-specific status takes priority over
    top-level product status — avoids reporting IN_STOCK for an OOS variant.
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

    # It's a dict
    # When a variant is specified, recurse into nested values BEFORE checking
    # top-level keys — nested values may contain variant-specific stock data.
    if variant_label or variant_id:
        for v in obj.values():
            status = _search_dict(v, variant_label, variant_id)
            if status:
                return status

    # Top-level keys (or fallback when no variant specified)
    status = _extract_stock_from_dict(obj)
    if status:
        return status

    # If no variant was specified, recurse (already done for variant case above)
    if not (variant_label or variant_id):
        for v in obj.values():
            status = _search_dict(v, variant_label, variant_id)
            if status:
                return status
    return None


def _item_matches_variant(item: dict, variant_label: str | None, variant_id: str | None) -> bool:
    """Return True if this dict entry looks like it corresponds to the target variant.

    Handles combined labels like "XL / marron" by checking each part separately.
    """
    # Build list of search terms: full label + individual parts
    search_terms: list[str] = []
    if variant_label:
        search_terms.append(variant_label.strip().lower())
        if " / " in variant_label:
            search_terms.extend(p.strip().lower() for p in variant_label.split(" / "))
    if variant_id:
        search_terms.append(variant_id.strip().lower())
        if " / " in variant_id:
            search_terms.extend(p.strip().lower() for p in variant_id.split(" / "))

    candidate_keys = ("size", "label", "name", "id", "sku", "variantId", "variant_id")
    for k in candidate_keys:
        val = item.get(k)
        if val is None:
            continue
        val_str = str(val).strip().lower()
        if val_str in search_terms:
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
    ["unavailable", "disabled", "out-of-stock", "out_of_stock", "sold-out", "sold_out",
     "pointer-events-none", "opacity-20", "opacity-30", "opacity-40", "opacity-50",
     "cursor-default", "bg-grey", "text-grey-dark", "line-through", "not-available"]
)


def _element_matches_variant(element, variant_label: str | None, variant_id: str | None) -> bool:
    """Check whether this element corresponds to the target variant.

    Handles combined labels like "XL / marron" by checking each part separately.
    """
    # Build list of search terms: full label + individual parts if combined with " / "
    search_terms: list[str] = []
    if variant_label:
        search_terms.append(variant_label.strip().lower())
        if " / " in variant_label:
            search_terms.extend(p.strip().lower() for p in variant_label.split(" / "))
    if variant_id:
        search_terms.append(variant_id.strip().lower())
        if " / " in variant_id:
            search_terms.extend(p.strip().lower() for p in variant_id.split(" / "))

    # Check data attributes
    for attr_key in ("data-size", "data-value", "data-id", "value"):
        attr_val = element.attrib.get(attr_key)
        if attr_val:
            attr_norm = attr_val.strip().lower()
            if attr_norm in search_terms:
                return True

    # Check text content (exact match or contains a search term)
    text = str(element.get_all_text()).strip().lower()
    # Skip elements that are clearly NOT variant selectors:
    # size guides, long descriptions, measurement tables
    if len(text) > 100 or any(w in text for w in ("tour de poitrine", "tour de taille",
            "chest", "waist", "hips", "bassin", "guide des tailles", "size guide")):
        return False
    if text in search_terms:
        return True
    # Also check if any search term appears as a word in the text
    for term in search_terms:
        if re.search(rf"\b{re.escape(term)}\b", text):
            return True

    return False


_OOS_TEXT = ("épuisé", "epuise", "sold out", "rupture", "indisponible", "out of stock",
             "épuisée", "unavailable", "coming soon")


def _element_is_unavailable(element) -> bool:
    """Return True if element signals unavailability via attributes, classes, or text."""
    # data-available="false"
    available_attr = element.attrib.get("data-available", "")
    if available_attr and available_attr.strip().lower() == "false":
        return True

    cls = element.attrib.get("class", "") or ""
    cls_lower = cls.lower()
    if any(fragment in cls_lower for fragment in _UNAVAILABLE_CLASS_FRAGMENTS):
        return True

    # Check child text for OOS keywords (Pimkie: <div class="product-flag">Épuisé</div>)
    try:
        all_text = str(element.get_all_text()).lower()
        if any(w in all_text for w in _OOS_TEXT):
            return True
    except Exception:
        pass

    return False


def _strategy_variant_attr(
    page,
    variant_label: str | None,
    variant_id: str | None,
) -> str | None:
    """Strategy 3: check variant/size element attributes for the target variant."""
    # Collect all matching elements, prioritising visible ones
    matches: list = []
    for selector in _VARIANT_SELECTORS:
        elements = page.css(selector)
        if not elements:
            continue
        for element in elements:
            if _element_matches_variant(element, variant_label, variant_id):
                matches.append(element)

    # Sort: visible elements first (hidden elements often have no OOS markup)
    def _is_hidden(el) -> bool:
        cls = (el.attrib.get("class") or "").lower()
        return any(h in cls for h in ("u-hidden", "hidden", "display-none", "sr-only", "visually-hidden"))
    matches.sort(key=lambda el: (1 if _is_hidden(el) else 0))

    for element in matches:
        # Check the element itself
        if _element_is_unavailable(element):
            return "OUT_OF_STOCK"
        # Also check parent (Pimkie: OOS class on parent, text on child label)
        parent = getattr(element, "parent", None)
        if parent is not None and _element_is_unavailable(parent):
            return "OUT_OF_STOCK"
        # Check siblings too (some themes use adjacent divs)
        if parent is not None:
            for sibling in getattr(parent, "children", []):
                if _element_is_unavailable(sibling):
                    return "OUT_OF_STOCK"
        # Visible match with no OOS signal → assume in stock
        if not _is_hidden(element):
            return "IN_STOCK"

    # Only hidden matches found → treat as available
    if matches:
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
