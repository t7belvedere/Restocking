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

  const destination = new URL(
    nextParam.startsWith("/") ? nextParam : "/dashboard",
    origin,
  );
  const redirectResponse = NextResponse.redirect(destination);
  const supabase = createRouteHandlerClient(request, redirectResponse);
  if (!supabase) {
    loginUrl.searchParams.set("error", "auth-client-init-failed");
    return NextResponse.redirect(loginUrl);
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) {
    loginUrl.searchParams.set("error", "oauth-callback-failed");
    return NextResponse.redirect(loginUrl);
  }

  // Apply onboarding answers from cookie if present
  const onboardingCookie = request.cookies.get("onboarding_answers");
  let onboarding: Record<string, unknown> | null = null;
  if (onboardingCookie?.value) {
    try {
      onboarding = JSON.parse(decodeURIComponent(onboardingCookie.value));
      await supabase.auth.updateUser({
        data: {
          first_name: (onboarding as any).first_name || "",
          preferred_brands: (onboarding as any).preferred_brands || [],
          preferred_size: (onboarding as any).preferred_size || null,
          missed_product_url: (onboarding as any).missed_product_url || null,
        },
      });
    } catch { /* ignore malformed cookie */ }
    // Clear the cookie
    redirectResponse.cookies.set("onboarding_answers", "", { maxAge: 0, path: "/" });
  }

  // If user provided a product URL during onboarding, redirect to add-watch page
  if (onboarding && (onboarding as any).missed_product_url) {
    destination.pathname = "/dashboard/add";
    destination.searchParams.set("url", (onboarding as any).missed_product_url);
  }

  return redirectResponse;
}
