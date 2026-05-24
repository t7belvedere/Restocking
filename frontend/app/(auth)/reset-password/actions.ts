"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type ResetPasswordState = {
  status: "idle" | "success" | "error";
  fieldErrors?: { password?: string };
  formError?: string;
  locale?: "fr" | "en";
};

function msg(locale: "fr" | "en", fr: string, en: string) {
  return locale === "fr" ? fr : en;
}

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const locale = (formData.get("locale") as "fr" | "en") || "fr";

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      locale,
      formError: msg(
        locale,
        "L'authentification n'est pas configurée pour le moment.",
        "Authentication is not configured right now.",
      ),
    };
  }

  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    return {
      status: "error",
      locale,
      fieldErrors: {
        password: msg(locale, "8 caractères minimum.", "8 characters minimum."),
      },
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      status: "error",
      locale,
      formError: msg(
        locale,
        "Le client Supabase n'a pas pu être initialisé.",
        "The Supabase client could not be initialised.",
      ),
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("updateUser error", error);
    return {
      status: "error",
      locale,
      formError: msg(
        locale,
        "Impossible de mettre à jour le mot de passe. Réessaie.",
        "Unable to update password. Please try again.",
      ),
    };
  }

  return { status: "success", locale };
}
