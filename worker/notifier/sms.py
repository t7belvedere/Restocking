"""SMS notifications for restock alerts via Twilio."""

import logging
import os

from dotenv import load_dotenv
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

load_dotenv()

logger = logging.getLogger(__name__)


def send_restock_sms(
    to_phone: str,
    product_name: str,
    variant_label: str | None,
    product_url: str,
    brand_name: str | None = None,
    price: float | None = None,
) -> bool:
    """Send restock SMS via Twilio. Pro plan only.

    Message format:
      {brand} — {product_name}
      Taille {variant}
      {price} € — De retour !
      {product_url}

    Returns True on success, False on failure.
    """
    try:
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")

        if not account_sid:
            logger.error("TWILIO_ACCOUNT_SID is not set")
            return False
        if not auth_token:
            logger.error("TWILIO_AUTH_TOKEN is not set")
            return False
        if not twilio_phone:
            logger.error("TWILIO_PHONE_NUMBER is not set")
            return False

        # Build message body
        lines = []
        if brand_name:
            lines.append(f"{brand_name} — {product_name}")
        else:
            lines.append(product_name)

        if variant_label:
            lines.append(f"Taille {variant_label}")

        if price is not None and price > 0:
            price_str = f"{price:.2f} €".replace(".", ",")
            lines.append(price_str)

        lines.append("De retour !")
        lines.append(product_url)

        message_body = "\n".join(lines)

        # Send via Twilio
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=message_body,
            from_=twilio_phone,
            to=to_phone,
        )

        logger.info("Restock SMS sent to %s (sid=%s)", to_phone, message.sid)
        return True

    except TwilioRestException as e:
        logger.error("Twilio API error sending SMS to %s: %s (code %s)", to_phone, e.msg, e.code)
        return False
    except Exception:
        logger.exception("Failed to send restock SMS to %s", to_phone)
        return False
