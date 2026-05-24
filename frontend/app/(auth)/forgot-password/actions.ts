"use server";

import { isSupabaseConfigured, getSiteUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

export type ForgotPasswordState = {
  status: "idle" | "success" | "error";
  fieldErrors?: { email?: string };
  formError?: string;
  locale?: "fr" | "en";
};

function msg(locale: "fr" | "en", fr: string, en: string) {
  return locale === "fr" ? fr : en;
}

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
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

  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return {
      status: "error",
      locale,
      fieldErrors: {
        email: msg(locale, "Adresse e-mail invalide.", "Invalid email address."),
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

  const siteUrl = getSiteUrl();
  const redirectTo = `${siteUrl}/auth/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    console.error("resetPasswordForEmail error", error);
  }

  // Always return success to avoid email enumeration
  return { status: "success", locale };
}
