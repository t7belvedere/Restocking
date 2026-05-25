"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, getSiteUrl } from "@/lib/supabase/env";

type OAuthProvider = "google" | "apple";

/**
 * Builds the OAuth callback URL. In production uses the canonical domain;
 * in local dev uses the request's Host header so the callback lands on the
 * same origin (e.g. 0.0.0.0:3000 vs localhost:3000).
 */
async function buildRedirectUrl(nextPath: string): Promise<string> {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  }

  const heads = await headers();
  const host = heads.get("host") || "localhost:3000";
  const proto = host.startsWith("localhost") || host.startsWith("0.0.0.0") || host.startsWith("127.") || host.startsWith("192.168.") || host.startsWith("10.") || host.startsWith("172.") ? "http" : "https";
  return `${proto}://${host}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}

/**
 * Initiates an OAuth flow via Supabase. On success, redirects the
 * browser to the provider's consent screen. On failure, redirects
 * back to /login with an error query param.
 */
async function signInWithOAuth(provider: OAuthProvider, formData?: FormData) {
  const locale = String(formData?.get("locale") ?? "fr");
  const nextPath = String(formData?.get("redirectTo") ?? "/dashboard");

  if (!isSupabaseConfigured()) {
    redirect(`/login?error=auth-not-configured&locale=${locale}`);
  }

  const supabase = await createClient();
  if (!supabase) {
    redirect(`/login?error=auth-client-init-failed&locale=${locale}`);
  }

  const redirectTo = await buildRedirectUrl(nextPath);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      ...(provider === "google" ? { scopes: "openid email profile" } : {}),
    },
  });

  if (error || !data?.url) {
    redirect(`/login?error=oauth-init-failed&locale=${locale}`);
  }

  redirect(data.url);
}

export async function signInWithGoogleAction(formData?: FormData) {
  return signInWithOAuth("google", formData);
}

export async function signInWithAppleAction(formData?: FormData) {
  return signInWithOAuth("apple", formData);
}
