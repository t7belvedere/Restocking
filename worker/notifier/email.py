"""Email notifications for restock alerts via Resend."""

import logging
import os
from urllib.parse import urlencode

import resend
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_FROM_EMAIL_DEFAULT = "alertes@restocking.app"
_BASE_URL = os.getenv("FRONTEND_URL", "https://www.restocking.app")


def send_restock_email(
    to_email: str,
    product_name: str,
    variant_label: str | None,
    product_url: str,
    watch_id: str = "",
    image_url: str | None = None,
    price: float | None = None,
    brand_name: str | None = None,
) -> bool:
    """Send a restock notification email via Resend.

    Returns True on success, False on failure.
    """
    try:
        api_key = os.getenv("RESEND_API_KEY")
        if not api_key:
            logger.error("RESEND_API_KEY is not set")
            return False

        resend.api_key = api_key
        from_email = os.getenv("FROM_EMAIL", _FROM_EMAIL_DEFAULT)

        # ── Subject ──────────────────────────────────────────────
        if variant_label:
            subject = f"✅ {product_name} — Taille {variant_label} est de retour !"
        else:
            subject = f"✅ {product_name} est de retour !"

        # ── Brand pill ───────────────────────────────────────────
        brand_pill = (
            f'<span style="display:inline-block;background:#111827;color:#FDFBF7;'
            f'padding:4px 12px;border-radius:9999px;font-size:12px;font-weight:700;'
            f'text-transform:uppercase;letter-spacing:0.05em;">{brand_name}</span>'
            if brand_name
            else ""
        )

        # ── Image block ──────────────────────────────────────────
        image_block = (
            f'<img src="{image_url}" alt="{product_name}" width="280" height="280" '
            f'style="display:block;width:100%;max-width:280px;height:auto;'
            f'border-radius:16px;border:2px solid #111827;margin:0 auto 20px;" />'
            if image_url
            else ""
        )

        # ── Variant tag ──────────────────────────────────────────
        variant_tag = (
            f'<span style="display:inline-block;background:#FDFBF7;'
            f'border:2px solid #111827;padding:6px 14px;border-radius:9999px;'
            f'font-family:monospace;font-size:14px;font-weight:700;color:#111827;">'
            f'{variant_label}</span>'
            if variant_label
            else ""
        )

        # ── Price block ──────────────────────────────────────────
        price_block = (
            f'<p style="font-family:monospace;font-size:22px;font-weight:700;'
            f'color:#111827;margin:8px 0 0 0;">{price:.2f} €</p>'
            if price is not None
            else ""
        )

        # ── Unsubscribe link ─────────────────────────────────────
        dashboard_url = f"{_BASE_URL}/dashboard"
        if watch_id:
            dashboard_url = f"{_BASE_URL}/dashboard/watches/{watch_id}"
        unsubscribe_params = urlencode({"watch_id": watch_id}) if watch_id else ""
        unsubscribe_url = f"{dashboard_url}?{unsubscribe_params}" if unsubscribe_params else dashboard_url

        # ── Build HTML ───────────────────────────────────────────
        html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{subject}</title>
</head>
<body style="margin:0;padding:0;background:#FDFBF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFBF7;padding:40px 0;">
    <tr>
      <td align="center">

        <!-- CARD -->
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border:2px solid #111827;border-radius:24px;
                      overflow:hidden;max-width:520px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:#111827;padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:20px;font-weight:800;color:#FDFBF7;
                        letter-spacing:-0.02em;font-family:Georgia,serif;">
                restocking
              </p>
              <p style="margin:6px 0 0 0;font-size:12px;color:rgba(253,251,247,0.6);
                        text-transform:uppercase;letter-spacing:0.12em;">
                Ton article est de retour
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:32px;">

              <!-- Brand + variant row -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:16px;">
                    {brand_pill}
                    {f'<span style="display:inline-block;margin-left:8px;">{variant_tag}</span>' if variant_tag else ""}
                  </td>
                </tr>
              </table>

              {image_block}

              <!-- Product name -->
              <h2 style="font-size:20px;font-weight:800;color:#111827;margin:0 0 4px 0;
                         line-height:1.2;letter-spacing:-0.01em;text-align:center;">
                {product_name}
              </h2>

              {price_block}

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <a href="{product_url}" target="_blank"
                       style="display:inline-block;background:#111827;color:#FDFBF7;
                              text-decoration:none;padding:14px 36px;border-radius:9999px;
                              font-size:15px;font-weight:700;letter-spacing:0.02em;
                              border:2px solid #111827;">
                      Voir le produit →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="border-top:2px dashed rgba(17,24,39,0.12);padding-top:20px;">

                    <!-- Status badge -->
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        <td style="background:#ECFDF5;border:2px solid #059669;
                                   padding:8px 16px;border-radius:9999px;text-align:center;">
                          <span style="display:inline-block;width:8px;height:8px;
                                       border-radius:50%;background:#059669;margin-right:8px;"></span>
                          <span style="font-size:12px;font-weight:700;color:#065F46;
                                       text-transform:uppercase;letter-spacing:0.08em;">
                            En stock
                          </span>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;
                              text-align:center;line-height:1.5;">
                      Le produit que tu surveilles est de nouveau disponible.<br />
                      Dépêche-toi, les stocks s&apos;épuisent vite&nbsp;!
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="border-top:2px solid #111827;padding:20px 32px;
                       background:#FDFBF7;text-align:center;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;line-height:1.6;">
                Tu reçois cet email car tu surveilles ce produit sur
                <a href="{_BASE_URL}" style="color:#111827;font-weight:600;">restocking.app</a>.
              </p>
              <p style="margin:8px 0 0 0;font-size:11px;">
                <a href="{unsubscribe_url}" target="_blank"
                   style="color:#9CA3AF;text-decoration:underline;">
                  Désactiver cette alerte
                </a>
                &nbsp;·&nbsp;
                <a href="{_BASE_URL}/dashboard" target="_blank"
                   style="color:#9CA3AF;text-decoration:underline;">
                  Tableau de bord
                </a>
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
