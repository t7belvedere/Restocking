"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function deleteUserAction(userId: string) {
  const supabase = await createClient();
  if (!supabase) throw new Error("Auth non configurée");

  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email !== "th3drata@gmail.com") {
    throw new Error("Accès refusé");
  }

  const adminClient = createAdminClient();
  if (!adminClient) throw new Error("Admin non configuré (SERVICE_ROLE_KEY manquante)");

  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Erreur suppression user:", error);
    throw new Error(error.message);
  }

  return { success: true };
}
