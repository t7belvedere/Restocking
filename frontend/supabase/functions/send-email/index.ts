import { templateFr, templateEn } from "./templates.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req) => {
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
