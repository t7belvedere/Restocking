import { templateFr, templateEn } from "./templates.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const HOOK_SECRET = Deno.env.get("HOOK_SECRET") || "";

// Vérifie la signature Svix envoyée par Supabase Auth Hooks
// Format : webhook-signature: v1,<base64_hmac>
// Signé sur : "<webhook-id>.<webhook-timestamp>.<body>"
async function verifySignature(req: Request, secret: string) {
  const msgSignature = req.headers.get("webhook-signature");
  const msgId = req.headers.get("webhook-id");
  const msgTimestamp = req.headers.get("webhook-timestamp");
  if (!msgSignature || !msgId || !msgTimestamp) return false;

  // Extraire les bytes bruts depuis "v1,whsec_<base64>"
  const whsecMatch = secret.match(/whsec_(.+)/);
  if (!whsecMatch) return false;
  const keyBytes = Uint8Array.from(atob(whsecMatch[1]), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const body = await req.clone().text();
  const signedContent = new TextEncoder().encode(`${msgId}.${msgTimestamp}.${body}`);

  // La signature peut contenir plusieurs versions séparées par des espaces
  for (const sig of msgSignature.split(" ")) {
    const idx = sig.indexOf(",");
    if (idx === -1) continue;
    const sigBytes = Uint8Array.from(atob(sig.slice(idx + 1)), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, signedContent);
    if (valid) return true;
  }
  return false;
}

Deno.serve(async (req) => {
  if (!(await verifySignature(req, HOOK_SECRET))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await req.json();
  const user = payload.user;
  const emailData = payload.email_data;

  // Récupérer la langue choisie lors de l'inscription (fr par défaut)
  const locale = user?.user_metadata?.locale === "fr" ? "fr" : "en";
  let html = locale === "fr" ? templateFr : templateEn;

  // On remplace les variables "Supabase" par leurs vraies valeurs
  html = html.replace("{{ .SiteURL }}", emailData.site_url);
  html = html.replace("{{ .TokenHash }}", emailData.token_hash);

  const subject = locale === "fr" 
    ? "Confirme ton adresse email ⚡️" 
    : "Confirm your email address ⚡️";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Restocking <alertes@restocking.app>",
      to: user.email,
      subject: subject,
      html: html,
    }),
  });

  if (res.ok) {
    return new Response(JSON.stringify({ message: "Email envoyé" }), { status: 200 });
  } else {
    const error = await res.text();
    console.error("Erreur Resend:", error);
    return new Response(JSON.stringify({ error }), { status: 400 });
  }
});
