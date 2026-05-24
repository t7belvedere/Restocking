import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import {
  isSupabaseConfigured,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
} from "./env";

const PROTECTED_PREFIXES = ["/dashboard", "/upgrade", "/admin"];
const AUTH_PREFIXES = ["/login", "/signup", "/forgot-password", "/reset-password"];

const THIRTY_DAYS = 30 * 24 * 60 * 60;

/**
 * Refreshes the Supabase session for every request, writes refreshed cookies
 * to the response, and performs lightweight route protection.
 *
 * Called from /app/frontend/proxy.ts (Next.js 16 renamed middleware → proxy).
 *
 * Uses getSession() (not getUser()) because getSession() actively refreshes
 * the token via the refresh token on every request, preventing premature
 * session expiry when browsing intermittently.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          // Ensure auth cookies persist across browser restarts.
          // Supabase sets expires for access/refresh tokens but explicit
          // maxAge guarantees the browser keeps them.
          response.cookies.set(name, value, {
            ...options,
            // Use maxAge from Supabase if provided, else default to 30 days.
            maxAge: options.maxAge ?? THIRTY_DAYS,
            secure: true,
            sameSite: "lax",
            path: "/",
          } as CookieOptions);
        });
      },
    },
  });

  if (!supabase) return response;

  // Use getUser() instead of getSession() for the proxy guard.
  // getSession() can return an expired token that getUser() rejects,
  // causing a redirect loop between the proxy and layout auth checks.
  let isAuthenticated = false;
  try {
    const { data } = await supabase.auth.getUser();
    isAuthenticated = Boolean(data.user);
  } catch {
    // Token validation failed — treat as unauthenticated.
  }

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Never cache auth-bearing responses, per Supabase advanced-SSR guide.
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
