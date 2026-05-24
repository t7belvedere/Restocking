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
) -> bool:
    """Send restock SMS via Twilio. Pro plan only.

    Message format: [Restocking] Taille {variant_label} — {product_name} est de retour ! → {product_url}
    Or without variant: [Restocking] {product_name} est de retour ! → {product_url}

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
        if variant_label:
            message_body = f"[Restocking] Taille {variant_label} — {product_name} est de retour ! → {product_url}"
        else:
            message_body = f"[Restocking] {product_name} est de retour ! → {product_url}"

        # Create Twilio client
        client = Client(account_sid, auth_token)

        # Send SMS
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
