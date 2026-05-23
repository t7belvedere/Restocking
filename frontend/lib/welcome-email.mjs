/**
 * @typedef {"fr" | "en"} WaitlistLocale
 */

const SITE_URL = "https://restocking.app";

/**
 * @param {string | null | undefined} locale
 * @returns {WaitlistLocale}
 */
export function normalizeWaitlistLocale(locale) {
  return locale === "en" ? "en" : "fr";
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const copy = {
  fr: {
    subject: "Bienvenue chez Restocking.",
    eyebrow: "Waitlist confirmée",
    headline: "Tu es officiellement sur la liste.",
    intro:
      "Ton adresse est verrouillée. On t'écrira dès que l'accès est prêt, sans spam ni blabla inutile.",
    bonus: "Top 100 = 3 mois de Pro offerts au lancement",
    emailLabel: "Adresse enregistrée",
    bodyTitle: "Ce qui se passe maintenant",
    bodyLines: [
      "On finalise l'ouverture de Restocking pour surveiller les retours en stock taille par taille.",
      "Tu recevras uniquement l'essentiel: l'accès au lancement et les grosses nouvelles produit.",
    ],
    cta: "Découvrir le site",
    footer:
      "Tu reçois cet email après avoir rejoint la waitlist sur restocking.app.",
    signature: "L'équipe Restocking",
  },
  en: {
    subject: "Welcome to Restocking.",
    eyebrow: "Waitlist confirmed",
    headline: "You are officially on the list.",
    intro:
      "Your address is locked in. We'll write the moment access is ready, with no spam and no filler.",
    bonus: "Top 100 = 3 free months of Pro at launch",
    emailLabel: "Saved address",
    bodyTitle: "What happens next",
    bodyLines: [
      "We are finishing Restocking so it can track size-specific returns the second stock is back.",
      "You will only get the essentials: launch access and major product updates.",
    ],
    cta: "Visit the site",
    footer:
      "You received this email after joining the restocking.app waitlist.",
    signature: "The Restocking team",
  },
};

/**
 * @param {{ email: string; locale?: string | null }} params
 */
export function buildWaitlistWelcomeEmail({ email, locale }) {
  const normalizedLocale = normalizeWaitlistLocale(locale);
  const content = copy[normalizedLocale];
  const safeEmail = escapeHtml(email);

  return {
    subject: content.subject,
    html: `<!DOCTYPE html>
<html lang="${normalizedLocale}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap');

      body {
        margin: 0;
        padding: 0;
        background: #fcfbf4;
        color: #171717;
        font-family: 'DM Sans', Arial, sans-serif;
      }

      a {
        color: inherit;
      }

      .page {
        padding: 32px 16px;
      }

      .shell {
        max-width: 620px;
        margin: 0 auto;
      }

      .panel {
        border: 2px solid #171717;
        background: #fffdf8;
        box-shadow: 10px 10px 0 0 #171717;
      }

      .header {
        background: #171717;
        color: #fcfbf4;
        padding: 18px 22px;
      }

      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .eyebrow {
        font-family: 'Bricolage Grotesque', Arial, sans-serif;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.2em;
        text-transform: uppercase;
      }

      .pulse {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: #c8ff68;
        border: 2px solid #fcfbf4;
      }

      .body {
        padding: 24px 22px 22px;
        position: relative;
      }

      .sticker {
        position: absolute;
        right: 22px;
        top: 22px;
        width: 72px;
        height: 72px;
        background: #6d8dff;
        border: 2px solid #171717;
        transform: rotate(9deg);
      }

      .headline {
        margin: 0;
        max-width: 72%;
        font-family: 'Bricolage Grotesque', Arial, sans-serif;
        font-size: 34px;
        line-height: 0.95;
        font-weight: 800;
        letter-spacing: -0.04em;
      }

      .intro {
        margin: 18px 0 0;
        max-width: 480px;
        font-size: 16px;
        line-height: 1.7;
        color: #171717cc;
      }

      .badge {
        display: inline-block;
        margin-top: 18px;
        padding: 9px 12px;
        border: 2px solid #171717;
        background: #c8ff68;
        font-family: 'Bricolage Grotesque', Arial, sans-serif;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .email-card {
        margin-top: 20px;
        border: 2px solid #171717;
        background: #ffffff;
        padding: 14px 16px;
      }

      .email-label {
        margin: 0 0 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #17171799;
      }

      .email-value {
        margin: 0;
        font-family: 'DM Sans', Arial, sans-serif;
        font-size: 15px;
        font-weight: 700;
      }

      .info {
        margin-top: 20px;
        border: 2px solid #171717;
        background: #fff3db;
        padding: 16px;
      }

      .info-title {
        margin: 0 0 10px;
        font-family: 'Bricolage Grotesque', Arial, sans-serif;
        font-size: 18px;
        font-weight: 700;
      }

      .info p {
        margin: 0 0 10px;
        font-size: 15px;
        line-height: 1.7;
      }

      .info p:last-child {
        margin-bottom: 0;
      }

      .cta {
        display: inline-block;
        margin-top: 22px;
        padding: 14px 18px;
        border: 2px solid #171717;
        background: #f29a3f;
        box-shadow: 4px 4px 0 0 #171717;
        font-family: 'Bricolage Grotesque', Arial, sans-serif;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-decoration: none;
        text-transform: uppercase;
      }

      .footer {
        padding: 18px 22px 24px;
        font-size: 12px;
        line-height: 1.6;
        color: #17171799;
      }

      .signature {
        margin: 0 0 6px;
        color: #171717;
        font-weight: 700;
      }

      .footer p {
        margin: 0;
      }

      @media only screen and (max-width: 640px) {
        .page {
          padding: 20px 12px;
        }

        .body,
        .header,
        .footer {
          padding-left: 16px;
          padding-right: 16px;
        }

        .headline {
          max-width: 100%;
          font-size: 29px;
        }

        .sticker {
          position: static;
          margin: 0 0 16px auto;
          display: block;
        }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="shell">
        <div class="panel">
          <div class="header">
            <div class="header-row">
              <div class="eyebrow">${content.eyebrow}</div>
              <div class="pulse"></div>
            </div>
          </div>

          <div class="body">
            <div class="sticker" aria-hidden="true"></div>
            <h1 class="headline">${content.headline}</h1>
            <p class="intro">${content.intro}</p>

            <div class="badge">${content.bonus}</div>

            <div class="email-card">
              <p class="email-label">${content.emailLabel}</p>
              <p class="email-value">${safeEmail}</p>
            </div>

            <div class="info">
              <h2 class="info-title">${content.bodyTitle}</h2>
              <p>${content.bodyLines[0]}</p>
              <p>${content.bodyLines[1]}</p>
            </div>

            <a class="cta" href="${SITE_URL}">${content.cta}</a>
          </div>

          <div class="footer">
            <p class="signature">${content.signature}</p>
            <p>${content.footer}</p>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`,
  };
}
