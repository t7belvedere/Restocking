"use server";

import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, getSiteUrl } from "@/lib/supabase/env";

const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

export type SignupState = {
  status: "idle" | "success" | "error";
  email?: string;
  fieldErrors?: { email?: string; password?: string };
  formError?: string;
  locale?: "fr" | "en";
};

function msg(locale: "fr" | "en", fr: string, en: string) {
  return locale === "fr" ? fr : en;
}

export async function signupAction(
  prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const locale = (formData.get("locale") as "fr" | "en") || "fr";

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      locale,
      formError: msg(
        locale,
        "L’authentification n’est pas configurée dans cet environnement. Ajoute tes clés Supabase pour activer la création de compte.",
        "Authentication is not configured for this environment. Add your Supabase keys to enable sign-up.",
      ),
    };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: SignupState["fieldErrors"] = {};
  if (!EMAIL_RE.test(email)) {
    fieldErrors.email = msg(locale, "Adresse e-mail invalide.", "Invalid email address.");
  }
  if (password.length < 8) {
    fieldErrors.password = msg(
      locale,
      "Mot de passe trop court (8 caractères minimum).",
      "Password too short (8 characters minimum).",
    );
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", locale, fieldErrors };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      status: "error",
      locale,
      formError: msg(
        locale,
        "Le client Supabase n’a pas pu être initialisé.",
        "The Supabase client could not be initialised.",
      ),
    };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/confirm`,
    },
  });

  if (error) {
    const authError = error as AuthError;
    if (authError.code === "user_already_exists" || authError.code === "email_address_invalid") {
      return {
        status: "error",
        locale,
        formError: msg(
          locale,
          "Un compte existe déjà pour cet e-mail. Connecte-toi.",
          "An account already exists for this email. Please sign in.",
        ),
      };
    }
    if (authError.code === "weak_password") {
      return {
        status: "error",
        locale,
        fieldErrors: {
          password: msg(
            locale,
            "Mot de passe trop faible. Mélange lettres, chiffres et symboles.",
            "Password too weak. Mix letters, numbers and symbols.",
          ),
        },
      };
    }
    return {
      status: "error",
      locale,
      formError: msg(
        locale,
        "Impossible de créer ton compte pour le moment. Réessaie.",
        "Unable to create your account at the moment. Please try again.",
      ),
    };
  }

  return { status: "success", email, locale };
}
