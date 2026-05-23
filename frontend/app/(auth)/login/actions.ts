"use server";

import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

export type LoginState = {
  status: "idle" | "error";
  fieldErrors?: { email?: string; password?: string };
  formError?: string;
  locale?: "fr" | "en";
};

function msg(locale: "fr" | "en", fr: string, en: string) {
  return locale === "fr" ? fr : en;
}

export async function loginAction(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const locale = (formData.get("locale") as "fr" | "en") || "fr";

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      locale,
      formError: msg(
        locale,
        "L’authentification n’est pas configurée dans cet environnement. Ajoute tes clés Supabase pour activer le sign-in.",
        "Authentication is not configured for this environment. Add your Supabase keys to enable sign-in.",
      ),
    };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard");

  const fieldErrors: LoginState["fieldErrors"] = {};
  if (!EMAIL_RE.test(email)) {
    fieldErrors.email = msg(locale, "Adresse e-mail invalide.", "Invalid email address.");
  }
  if (password.length < 1) {
    fieldErrors.password = msg(locale, "Saisis ton mot de passe.", "Please enter your password.");
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

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const authError = error as AuthError;
    if (authError.code === "invalid_credentials") {
      return {
        status: "error",
        locale,
        formError: msg(
          locale,
          "E-mail ou mot de passe incorrect.",
          "The email or password you entered is incorrect.",
        ),
      };
    }
    if (authError.code === "email_not_confirmed") {
      return {
        status: "error",
        locale,
        formError: msg(
          locale,
          "Ton e-mail n’est pas encore vérifié. Clique sur le lien dans la boîte de réception.",
          "Your email is not verified yet. Check your inbox for the confirmation link.",
        ),
      };
    }
    return {
      status: "error",
      locale,
      formError: msg(
        locale,
        "Impossible de te connecter pour le moment. Réessaie dans un instant.",
        "Unable to sign you in right now. Please try again.",
      ),
    };
  }

  if (!data.session) {
    return {
      status: "error",
      locale,
      formError: msg(
        locale,
        "Aucune session n’a été créée. Réessaie.",
        "No session was created. Please try again.",
      ),
    };
  }

  redirect(redirectTo.startsWith("/") ? redirectTo : "/dashboard");
}
