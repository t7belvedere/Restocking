import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Password reset callback handler (PKCE).
 *
 * Configure your Supabase "Reset Password" email template so the link
 * points here, e.g.:
 *   {{ .SiteURL }}/auth/reset-password?code={{ .TokenHash }}&type=recovery
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;
  const loginUrl = new URL("/login", origin);
  const resetUrl = new URL("/reset-password", origin);

  if (!isSupabaseConfigured()) {
    loginUrl.searchParams.set("error", "auth-not-configured");
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    loginUrl.searchParams.set("error", "missing-token");
    return NextResponse.redirect(loginUrl);
  }

  const redirectResponse = NextResponse.redirect(resetUrl);
  const supabase = createRouteHandlerClient(request, redirectResponse);
  if (!supabase) {
    loginUrl.searchParams.set("error", "auth-client-init-failed");
    return NextResponse.redirect(loginUrl);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("reset-password exchangeCodeForSession error", error);
    resetUrl.searchParams.set("error", "expired");
    return NextResponse.redirect(resetUrl);
  }

  return redirectResponse;
}
