"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { buildWaitlistWelcomeEmail, normalizeWaitlistLocale } from "@/lib/welcome-email.mjs";

export async function joinWaitlist(email: string, locale: string, referrer: string | null) {
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "DB_ERROR" };

  const normalizedLocale = normalizeWaitlistLocale(locale);

  const { error } = await supabase
    .from("waitlist")
    .insert([{ email, locale: normalizedLocale, referrer }])
    .select();

  if (error) {
    if (error.code === "23505") {
      return { ok: true, already: true, position: null };
    }
    return { ok: false, error: "DB_ERROR" };
  }

  // Envoi de l'email de bienvenue
  const welcomeEmail = buildWaitlistWelcomeEmail({
    email,
    locale: normalizedLocale,
  });

  await sendEmail({
    to: email,
    subject: welcomeEmail.subject,
    html: welcomeEmail.html,
  });

  // Get current position
  const { count } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  return { ok: true, already: false, position: count ?? 1 };
}
