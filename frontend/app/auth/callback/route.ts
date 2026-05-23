import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * OAuth callback — exchanges the PKCE code returned by the provider
 * (Google, etc.) for a Supabase session. Cookies are written on the
 * response so subsequent navigations are authenticated.
 *
 * Doc: https://supabase.com/docs/guides/auth/sessions/pkce-flow
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/dashboard";

  const origin = url.origin;
  const loginUrl = new URL("/login", origin);

  if (!isSupabaseConfigured()) {
    loginUrl.searchParams.set("error", "auth-not-configured");
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    loginUrl.searchParams.set("error", "missing-oauth-code");
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  const supabase = createRouteHandlerClient(request, response);
  if (!supabase) {
    loginUrl.searchParams.set("error", "auth-client-init-failed");
    return NextResponse.redirect(loginUrl);
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) {
    loginUrl.searchParams.set("error", "oauth-callback-failed");
    return NextResponse.redirect(loginUrl);
  }

  const destination = new URL(
    nextParam.startsWith("/") ? nextParam : "/dashboard",
    origin,
  );
  // Preserve any cookies set by createRouteHandlerClient on the redirect.
  return NextResponse.redirect(destination, { headers: response.headers });
}
