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

# ── Palette ────────────────────────────────────────────────────────
_DARK = "#0F0F0F"
_WHITE = "#FFFFFF"
_CREAM = "#FAFAF8"
_ORANGE = "#E85D2C"
_GREEN = "#059669"
_MUTED = "#9CA3AF"
_BORDER = "#E5E7EB"


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
    """Send a restock notification email via Resend."""

    try:
        api_key = os.getenv("RESEND_API_KEY")
        if not api_key:
            logger.error("RESEND_API_KEY is not set")
            return False

        resend.api_key = api_key
        from_email = os.getenv("FROM_EMAIL", _FROM_EMAIL_DEFAULT)

        # ── Subject ──────────────────────────────────────────────
        if variant_label:
            subject = f"✅ {product_name} — Taille {variant_label} est de retour"
        else:
            subject = f"✅ {product_name} est de retour"

        # ── Price line ───────────────────────────────────────────
        price_line = f"{price:.0f} €" if price is not None else ""

        # ── Brand + variant subtitle ─────────────────────────────
        subtitle_parts = []
        if brand_name:
            subtitle_parts.append(brand_name.title())
        if variant_label:
            subtitle_parts.append(f"Taille {variant_label}")
        subtitle = " · ".join(subtitle_parts) if subtitle_parts else ""

        # ── Unsubscribe URL ──────────────────────────────────────
        dashboard_url = f"{_BASE_URL}/dashboard"
        if watch_id:
            dashboard_url = f"{_BASE_URL}/dashboard/watches/{watch_id}"

        # ── Logo (inline SVG) ────────────────────────────────────
        logo_svg = (
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" '
            'width="28" height="28" style="vertical-align:middle;margin-right:10px;">'
            '<circle cx="50" cy="50" r="46" fill="none" stroke="#fff" stroke-width="4" opacity="0.4"/>'
            '<circle cx="50" cy="50" r="14" fill="#E85D2C"/>'
            '<circle cx="50" cy="50" r="6" fill="#fff" opacity="0.5"/>'
            '<circle cx="50" cy="50" r="24" fill="none" stroke="#E85D2C" stroke-width="2" opacity="0.5"/>'
            '</svg>'
        )

        html = f"""<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:{_CREAM};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
<tr><td align="center">

  <!-- CARD -->
  <table width="460" cellpadding="0" cellspacing="0"
         style="background:{_WHITE};border:1px solid {_BORDER};border-radius:16px;
                max-width:460px;width:100%;">

    <!-- Header -->
    <tr>
      <td style="background:{_DARK};padding:28px 32px 24px 32px;border-radius:16px 16px 0 0;">
        <p style="margin:0;font-size:20px;font-weight:800;color:{_WHITE};
                  letter-spacing:-0.02em;">
          {logo_svg}restocking
        </p>
        <p style="margin:8px 0 0 0;font-size:18px;font-weight:600;color:{_WHITE};
                  line-height:1.3;">
          {product_name}
        </p>
        {f'<p style="margin:6px 0 0 0;font-size:14px;color:{_ORANGE};font-weight:500;">{subtitle}</p>' if subtitle else ""}
      </td>
    </tr>

    <!-- Product image -->
    {f'''<tr>
      <td style="padding:0;">
        <img src="{image_url}" alt="" width="460" height="460"
             style="display:block;width:100%;height:auto;border:0;" />
      </td>
    </tr>''' if image_url else ""}

    <!-- Info + CTA -->
    <tr>
      <td style="padding:28px 32px;">

        <!-- Price + status row -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            {f'<td style="font-size:28px;font-weight:800;color:{_DARK};">{price_line}</td>' if price_line else '<td></td>'}
            <td align="right">
              <span style="display:inline-block;background:#ECFDF5;color:{_GREEN};
                           font-size:12px;font-weight:700;text-transform:uppercase;
                           letter-spacing:0.06em;padding:6px 14px;border-radius:9999px;">
                En stock
              </span>
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <a href="{product_url}" target="_blank"
           style="display:block;background:{_DARK};color:{_WHITE};
                  text-align:center;text-decoration:none;
                  padding:16px 24px;border-radius:12px;
                  font-size:16px;font-weight:600;">
          Voir le produit →
        </a>

        <!-- Hint -->
        <p style="margin:16px 0 0 0;font-size:13px;color:{_MUTED};text-align:center;">
          Les stocks s&apos;épuisent vite — ne tarde pas&nbsp;!
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="border-top:1px solid {_BORDER};padding:20px 32px;
                 text-align:center;border-radius:0 0 16px 16px;">
        <p style="margin:0;font-size:12px;color:{_MUTED};line-height:1.6;">
          Envoyé par <a href="{_BASE_URL}" style="color:{_DARK};font-weight:600;text-decoration:none;">restocking.app</a>
          &nbsp;·&nbsp;
          <a href="{dashboard_url}" target="_blank" style="color:{_MUTED};">Gérer mes alertes</a>
          &nbsp;·&nbsp;
          <a href="{dashboard_url}" target="_blank" style="color:{_MUTED};">Désactiver</a>
        </p>
      </td>
    </tr>

  </table>

</td></tr>
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
