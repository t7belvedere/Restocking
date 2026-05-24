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
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next");
  const origin = url.origin;
  const loginUrl = new URL("/login", origin);

  if (!isSupabaseConfigured()) {
    loginUrl.searchParams.set("error", "auth-not-configured");
    return NextResponse.redirect(loginUrl);
  }

  if (!tokenHash && !code) {
    loginUrl.searchParams.set("error", "missing-token");
    return NextResponse.redirect(loginUrl);
  }

  const destinationPath =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";
  const destination = new URL(destinationPath, origin);

  // Create the redirect response first so Supabase writes session cookies
  // directly onto it. Using NextResponse.next() in a route handler (not
  // middleware) can produce an empty response — avoid it.
  const redirectResponse = NextResponse.redirect(destination);
  const supabase = createRouteHandlerClient(request, redirectResponse);
  if (!supabase) {
    loginUrl.searchParams.set("error", "auth-client-init-failed");
    return NextResponse.redirect(loginUrl);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (error) {
      loginUrl.searchParams.set("error", "invalid-or-expired-link");
      return NextResponse.redirect(loginUrl);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      loginUrl.searchParams.set("error", "invalid-or-expired-link");
      return NextResponse.redirect(loginUrl);
    }
  } else {
    loginUrl.searchParams.set("error", "missing-token");
    return NextResponse.redirect(loginUrl);
  }

  return redirectResponse;
}
