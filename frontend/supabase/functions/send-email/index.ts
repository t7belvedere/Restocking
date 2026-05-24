import { templateFr, templateEn } from "./templates.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const HOOK_SECRET = Deno.env.get("HOOK_SECRET") || "";

// Fonction utilitaire pour vérifier la signature HMAC envoyée par Supabase
async function verifySignature(req: Request, secret: string) {
  const signature = req.headers.get("x-webhook-signature");
  if (!signature) return false;

  // Le secret est au format "v1,whsec_<base64>" — on extrait les bytes bruts
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
  // La signature est au format "t=<timestamp>,v1=<base64_hmac>"
  const parts = Object.fromEntries(
    signature.split(",").map((p) => {
      const idx = p.indexOf("=");
      return [p.slice(0, idx), p.slice(idx + 1)];
    })
  );
  const timestamp = parts["t"];
  const sig = parts["v1"];
  if (!timestamp || !sig) return false;

  const data = new TextEncoder().encode(`${timestamp}.${body}`);
  return await crypto.subtle.verify(
    "HMAC",
    key,
    Uint8Array.from(atob(sig), (c) => c.charCodeAt(0)),
    data
  );
}

Deno.serve(async (req) => {
  // Sécurité : Vérifier la signature HMAC
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
