"use server";

import { createClient } from "@/lib/supabase/server";

export type ProfileData = {
  first_name?: string;
  preferred_size?: string | null;
  preferred_brands?: string[];
};

export type ProfileResult = {
  ok: boolean;
  error?: string;
};

export async function updateProfile(data: ProfileData): Promise<ProfileResult> {
  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Non authentifié. Reconnecte-toi." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Session expirée. Reconnecte-toi." };
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      first_name: data.first_name ?? user.user_metadata.first_name,
      preferred_size: data.preferred_size !== undefined ? data.preferred_size : user.user_metadata.preferred_size,
      preferred_brands: data.preferred_brands ?? user.user_metadata.preferred_brands,
    },
  });

  if (error) {
    return { ok: false, error: "Impossible de sauvegarder. Réessaie." };
  }
  return { ok: true };
}
