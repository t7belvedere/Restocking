"use server";

import { createClient } from "@/lib/supabase/server";

export async function deleteWaitlistEntry(email: string) {
  const supabase = await createClient();
  if (!supabase) {
    console.error("deleteWaitlistEntry: No supabase client");
    return { ok: false, error: "DB_ERROR" };
  }

  console.log("Attempting to delete from waitlist:", email);

  const { error } = await supabase
    .from("waitlist")
    .delete()
    .eq("email", email);

  if (error) {
    console.error("deleteWaitlistEntry error:", error);
    return { ok: false, error: "DB_ERROR" };
  }

  console.log("Successfully deleted:", email);
  return { ok: true };
}
