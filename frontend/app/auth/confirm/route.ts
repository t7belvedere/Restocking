import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Email confirmation handler (PKCE).
 *
 * Configure your Supabase "Confirm signup" email template so the link
 * points here, e.g.:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const origin = url.origin;
  const loginUrl = new URL("/login", origin);

  if (!isSupabaseConfigured()) {
    loginUrl.searchParams.set("error", "auth-not-configured");
    return NextResponse.redirect(loginUrl);
  }

  if (!tokenHash || !type) {
    loginUrl.searchParams.set("error", "missing-token");
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  const supabase = createRouteHandlerClient(request, response);
  if (!supabase) {
    loginUrl.searchParams.set("error", "auth-client-init-failed");
    return NextResponse.redirect(loginUrl);
  }

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    loginUrl.searchParams.set("error", "invalid-or-expired-link");
    return NextResponse.redirect(loginUrl);
  }

  const dashboardUrl = new URL("/dashboard", origin);
  return NextResponse.redirect(dashboardUrl, { headers: response.headers });
}
