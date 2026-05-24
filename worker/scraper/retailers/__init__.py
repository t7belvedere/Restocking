from typing import Any
from urllib.parse import urlparse
from scraper.retailers.zara import parse_zara
from scraper.retailers.cos import parse_cos


def _wrap_zara(page, variant_label, variant_id, url=""):
    """Wrap parse_zara to match the consistent interface."""
    return parse_zara(page, variant_label, variant_id)


# Map domain keywords → parser callable
_REGISTRY: dict[str, Any] = {
    "zara.com": _wrap_zara,
    "cos.com": parse_cos,
}


def get_parser(url: str):
    """Return the retailer-specific parser for the given URL, or None for generic detection.

    Returns a callable with signature: (page, variant_label, variant_id, url="") -> (status, signal_source)
    or None if no specific parser is available.
    """
    try:
        hostname = urlparse(url).hostname or ""
        for domain, parser in _REGISTRY.items():
            if domain in hostname:
                return parser
    except Exception:
        pass
    return None
