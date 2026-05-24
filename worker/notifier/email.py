"""Email notifications for restock alerts via Resend."""

import logging
import os

import resend
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_FROM_EMAIL_DEFAULT = "alertes@restocking.app"


def send_restock_email(
    to_email: str,
    product_name: str,
    variant_label: str | None,
    product_url: str,
    image_url: str | None = None,
    price: float | None = None,
) -> bool:
    """Send a restock notification email via Resend.

    Returns True on success, False on failure.
    Available for all plans (Free and Pro).
    """
    try:
        api_key = os.getenv("RESEND_API_KEY")
        if not api_key:
            logger.error("RESEND_API_KEY is not set")
            return False

        resend.api_key = api_key
        from_email = os.getenv("FROM_EMAIL", _FROM_EMAIL_DEFAULT)

        # Subject
        if variant_label:
            subject = f"✅ {product_name} — Taille {variant_label} est de retour !"
        else:
            subject = f"✅ {product_name} est de retour !"

        # HTML body
        image_block = (
            f'<img src="{image_url}" alt="{product_name}" '
            f'style="max-width:300px;width:100%;border-radius:8px;margin:16px 0;" />'
            if image_url
            else ""
        )

        variant_block = (
            f'<p style="font-size:16px;color:#555;margin:4px 0;">'
            f"{variant_label}</p>"
            if variant_label
            else ""
        )

        price_block = (
            f'<p style="font-size:18px;font-weight:bold;color:#111;margin:8px 0;">'
            f"{price:.2f} €</p>"
            if price is not None
            else ""
        )

        html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{subject}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;
                      max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:24px 32px;">
              <p style="margin:0;color:#ffffff;font-size:18px;font-weight:bold;">
                Restocking
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="font-size:22px;color:#111;margin:0 0 8px 0;">
                {product_name}
              </h2>
              {variant_block}
              {image_block}
              {price_block}
              <p style="font-size:15px;color:#444;margin:16px 0;">
                Le produit que vous surveillez est de nouveau disponible.
                Dépêchez-vous, les stocks s'épuisent vite !
              </p>
              <a href="{product_url}"
                 style="display:inline-block;background:#111827;color:#ffffff;
                        text-decoration:none;padding:14px 28px;border-radius:8px;
                        font-size:16px;font-weight:bold;margin-top:8px;">
                Voir le produit →
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                Vous recevez cet email car vous surveillez ce produit sur Restocking.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

        params: resend.Emails.SendParams = {
            "from": from_email,
            "to": [to_email],
            "subject": subject,
            "html": html,
        }

        result = resend.Emails.send(params)
        email_id = result.get("id") if isinstance(result, dict) else getattr(result, "id", None)
        logger.info("Restock email sent to %s (id=%s)", to_email, email_id)
        return True

    except Exception:
        logger.exception("Failed to send restock email to %s", to_email)
        return False
