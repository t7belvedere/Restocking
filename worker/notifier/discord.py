"""Discord webhook notifications for restock alerts."""

import logging
import os

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")

_COLOR_IN_STOCK = 0x059669  # green
_COLOR_BRAND = 0xE85D2C    # orange


def send_discord_notification(
    product_name: str,
    variant_label: str | None,
    product_url: str,
    brand_name: str | None = None,
    price: float | None = None,
    image_url: str | None = None,
    watch_id: str = "",
) -> bool:
    """Post a restock alert to a Discord channel via webhook.

    Returns True on success, False on failure.
    """
    if not _WEBHOOK_URL:
        logger.warning("DISCORD_WEBHOOK_URL is not set — skipping Discord notification")
        return False

    try:
        fields = []
        if brand_name:
            fields.append({"name": "Boutique", "value": brand_name, "inline": True})
        if variant_label:
            fields.append({"name": "Taille / Couleur", "value": variant_label, "inline": True})
        if price is not None:
            fields.append({"name": "Prix", "value": f"{price:.2f} €", "inline": True})

        embed = {
            "title": f"✅ EN STOCK — {product_name}",
            "url": product_url,
            "color": _COLOR_IN_STOCK,
            "fields": fields,
            "footer": {"text": "restocking.app — alerte automatique"},
            "timestamp": httpx._utils.utcnow().isoformat() + "Z" if hasattr(httpx._utils, "utcnow") else "",
        }

        if image_url:
            embed["thumbnail"] = {"url": image_url}

        payload = {
            "embeds": [embed],
        }

        r = httpx.post(_WEBHOOK_URL, json=payload, timeout=10)
        if r.status_code in (200, 204):
            logger.info("Discord notification sent for %s", product_name)
            return True
        else:
            logger.warning("Discord webhook returned %d: %s", r.status_code, r.text[:200])
            return False

    except Exception:
        logger.exception("Failed to send Discord notification for %s", product_name)
        return False
