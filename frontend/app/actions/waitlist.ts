"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { WelcomeEmailTemplate } from "@/lib/welcome-template";

export async function joinWaitlist(email: string, locale: string, referrer: string | null) {
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "DB_ERROR" };

  const { data, error } = await supabase
    .from("waitlist")
    .insert([{ email, locale, referrer }])
    .select();

  if (error) {
    if (error.code === "23505") {
      return { ok: true, already: true, position: null };
    }
    return { ok: false, error: "DB_ERROR" };
  }

  // Envoi de l'email de bienvenue
  await sendEmail({
    to: email,
    subject: "Bienvenue chez Restocking ! 🎉",
    html: WelcomeEmailTemplate({ email }),
  });

  // Get current position
  const { count } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  return { ok: true, already: false, position: count ?? 1 };
}
