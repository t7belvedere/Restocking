"use server";

import { createClient } from "@/lib/supabase/server";

export async function joinWaitlist(email: string, locale: string, referrer: string | null) {
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "DB_ERROR" };

  const { data, error } = await supabase
    .from("waitlist")
    .insert([{ email, locale, referrer }])
    .select();

  if (error) {
    // 23505 is Postgres unique violation
    if (error.code === "23505") {
      return { ok: true, already: true, position: null };
    }
    return { ok: false, error: "DB_ERROR" };
  }

  // Get current position
  const { count } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  return { ok: true, already: false, position: count ?? 1 };
}
