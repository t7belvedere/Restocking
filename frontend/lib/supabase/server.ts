import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";
import {
  isSupabaseConfigured,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
} from "./env";

/**
 * Server client usable from server components, layouts, and Server Actions.
 * Returns null when Supabase env vars are missing so callers can render an
 * "Auth not configured" UI instead of crashing.
 *
 * NOTE: This client cannot reliably write cookies from Server Components.
 * Session refresh happens in proxy.ts; for route handlers that need to write
 * cookies (e.g. /auth/callback), use createSupabaseRouteHandlerClient below.
 */
export async function createClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // ignored — called from a Server Component, refresh occurs in proxy.ts
        }
      },
    },
  });
}

/**
 * Route-handler client — used by /auth/callback and /auth/confirm.
 * Writes cookies on both the request and response so the session is
 * available on subsequent navigations.
 */
export function createRouteHandlerClient(
  request: NextRequest,
  response: NextResponse,
): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options as CookieOptions);
        });
      },
    },
  });
}
