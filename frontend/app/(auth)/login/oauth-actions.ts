"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, getSiteUrl } from "@/lib/supabase/env";

/**
 * Initiates the Google OAuth flow via Supabase. On success, redirects the
 * browser to Google's consent screen. On failure, redirects back to /login
 * with an error query param.
 *
 * Called from a form action="..." on the login/signup forms.
 */
export async function signInWithGoogleAction(formData?: FormData) {
  const locale = String(formData?.get("locale") ?? "fr");
  const nextPath = String(formData?.get("redirectTo") ?? "/dashboard");

  if (!isSupabaseConfigured()) {
    redirect(`/login?error=auth-not-configured&locale=${locale}`);
  }

  const supabase = await createClient();
  if (!supabase) {
    redirect(`/login?error=auth-client-init-failed&locale=${locale}`);
  }

  const redirectTo = `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(nextPath)}`;

  const { data, error } = await supabase!.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      scopes: "openid email profile",
    },
  });

  if (error || !data?.url) {
    redirect(`/login?error=oauth-init-failed&locale=${locale}`);
  }

  redirect(data!.url);
}
