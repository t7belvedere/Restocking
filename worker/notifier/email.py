"""Email notifications for restock alerts via Resend."""

import logging
import os

import resend
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_FROM_EMAIL_DEFAULT = "alertes@restocking.app"
_BASE_URL = os.getenv("FRONTEND_URL", "https://www.restocking.app")
_WORKER_URL = os.getenv("WORKER_API_URL", "https://restocking-production.up.railway.app")
_BRANDFETCH_CLIENT = "1idoVDqRtZmwOL9NXro"

# Brand colours (hex for email client compatibility)
_INK = "#111827"
_CREAM = "#FDFBF7"
_ORANGE = "#E85D2C"
_LIME = "#C8F545"
_BLUE = "#4A7FCF"
_EMERALD = "#059669"
_GREY = "#6B7280"
_GREY_LIGHT = "#9CA3AF"


def _extract_domain(url: str) -> str | None:
    """Extract domain from a product URL for Brandfetch logo lookup."""
    from urllib.parse import urlparse as _urlparse

    try:
        hostname = _urlparse(url).hostname or ""
        hostname = hostname.replace("www.", "")
        if not hostname:
            return None
        return hostname
    except Exception:
        return None


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

        # ── Brand logo (Brandfetch CDN) ──────────────────────────
        brand_domain = _extract_domain(product_url)
        brandfetch_url = (
            f"https://cdn.brandfetch.io/{brand_domain}/theme/dark"
            f"?c={_BRANDFETCH_CLIENT}"
            if brand_domain
            else ""
        )
        brand_logo = (
            f'<img src="{brandfetch_url}" alt="{brand_name or brand_domain}" '
            f'height="24" '
            f'style="display:block;height:24px;width:auto;max-width:140px;'
            f'filter:brightness(0)invert(1);" />'
            if brandfetch_url
            else ""
        )

        # ── Brand + variant pills (same size) ────────────────────
        pill_style = (
            "display:inline-block;padding:5px 14px;border-radius:9999px;"
            "font-size:13px;font-weight:700;letter-spacing:0.04em;"
            "text-transform:uppercase;"
        )
        brand_pill = (
            f'<span style="{pill_style}background:{_ORANGE};color:{_CREAM};">'
            f'{brand_name}</span>'
            if brand_name
            else ""
        )
        variant_tag = (
            f'<span style="{pill_style}background:{_CREAM};color:{_INK};'
            f'border:2px solid {_INK};">{variant_label}</span>'
            if variant_label
            else ""
        )

        # ── Image block ──────────────────────────────────────────
        image_block = (
            f'<img src="{image_url}" alt="{product_name}" width="280" height="280" '
            f'style="display:block;width:100%;max-width:280px;height:auto;'
            f'border-radius:16px;border:3px solid {_INK};margin:0 auto 20px;" />'
            if image_url
            else ""
        )

        # ── Price block ──────────────────────────────────────────
        price_block = (
            f'<p style="font-family:monospace;font-size:22px;font-weight:700;'
            f'color:{_INK};margin:8px 0 0 0;text-align:center;">{price:.2f} €</p>'
            if price is not None
            else ""
        )

        # ── Links ───────────────────────────────────────────────
        dashboard_url = f"{_BASE_URL}/dashboard"
        if watch_id:
            dashboard_url = f"{_BASE_URL}/dashboard/watches/{watch_id}"
        unsubscribe_url = f"{_WORKER_URL}/unsubscribe?watch_id={watch_id}" if watch_id else dashboard_url

        # ── Logo (PNG from restocking.app) ────────────────────────
        logo_img = (
            f'<img src="https://www.restocking.app/apple-touch-icon.png" '
            f'width="32" height="32" alt="restocking" '
            f'style="vertical-align:middle;margin-right:8px;border-radius:8px;" />'
        )

        # ── Build HTML ───────────────────────────────────────────
        html = f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{subject}</title>
</head>
<body style="margin:0;padding:0;background:{_CREAM};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:{_CREAM};padding:40px 0;">
    <tr>
      <td align="center">

        <!-- OUTER CARD -->
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#fff;border:3px solid {_INK};border-radius:24px;
                      overflow:hidden;max-width:520px;width:100%;
                      box-shadow:6px 6px 0 0 {_ORANGE};">

          <!-- HEADER -->
          <tr>
            <td style="background:{_INK};padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:left;vertical-align:middle;">
                    <p style="margin:0;font-size:20px;font-weight:800;color:{_CREAM};
                              letter-spacing:-0.02em;font-family:Georgia,serif;">
                      {logo_img}restocking
                    </p>
                  </td>
                  {f'<td style="text-align:right;vertical-align:middle;">{brand_logo}</td>' if brand_logo else ""}
                </tr>
              </table>
              <p style="margin:6px 0 0 0;font-size:11px;color:{_ORANGE};
                        text-transform:uppercase;letter-spacing:0.15em;font-weight:600;">
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
                  <td style="padding-bottom:20px;text-align:center;">
                    {brand_pill}
                    {f'{variant_tag}' if variant_tag else ""}
                  </td>
                </tr>
              </table>

              {image_block}

              <!-- Product name -->
              <h2 style="font-size:20px;font-weight:800;color:{_INK};margin:0 0 4px 0;
                         line-height:1.2;letter-spacing:-0.01em;text-align:center;">
                {product_name}
              </h2>

              {price_block}

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <a href="{product_url}" target="_blank"
                       style="display:inline-block;background:{_ORANGE};color:{_CREAM};
                              text-decoration:none;padding:14px 36px;border-radius:9999px;
                              font-size:15px;font-weight:700;letter-spacing:0.02em;
                              border:3px solid {_INK};
                              box-shadow:3px 3px 0 0 {_INK};">
                      Voir le produit →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0 0;">
                <tr>
                  <td style="border-top:2px dashed {_GREY_LIGHT};padding-top:20px;">

                    <!-- Status badge -->
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        <td style="background:{_LIME};border:2px solid {_INK};
                                   padding:8px 16px;border-radius:9999px;text-align:center;">
                          <span style="display:inline-block;width:8px;height:8px;
                                       border-radius:50%;background:{_EMERALD};margin-right:6px;
                                       animation:ping 1.5s infinite;"></span>
                          <span style="font-size:11px;font-weight:700;color:{_INK};
                                       text-transform:uppercase;letter-spacing:0.08em;">
                            En stock
                          </span>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:14px 0 0 0;font-size:14px;color:{_GREY};
                              text-align:center;line-height:1.6;">
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
            <td style="border-top:3px solid {_INK};padding:20px 32px;
                       background:{_CREAM};text-align:center;">
              <p style="margin:0;font-size:11px;color:{_GREY_LIGHT};line-height:1.6;">
                Tu reçois cet email car tu surveilles ce produit sur
                <a href="{_BASE_URL}" style="color:{_INK};font-weight:700;text-decoration:none;">
                  restocking.app
                </a>
              </p>
              <p style="margin:10px 0 0 0;font-size:11px;">
                <a href="{unsubscribe_url}" target="_blank"
                   style="display:inline-block;color:{_INK};font-weight:600;
                          background:{_CREAM};border:2px solid {_INK};
                          padding:6px 16px;border-radius:9999px;
                          text-decoration:none;font-size:11px;">
                  Désactiver cette alerte
                </a>
                &nbsp;
                <a href="{_BASE_URL}/dashboard" target="_blank"
                   style="color:{_GREY_LIGHT};font-size:11px;">
                  Tableau de bord
                </a>
              </p>
            </td>
          </tr>

        </table>

        <!-- OUTSIDE TEASER -->
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;margin-top:16px;">
          <tr>
            <td style="text-align:center;padding:0 32px;">
              <p style="margin:0;font-size:11px;color:{_GREY_LIGHT};line-height:1.5;">
                Restocking surveille 50+ boutiques mode et te prévient<br />
                dès que ta taille revient en stock.
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
