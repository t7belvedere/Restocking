"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

let browserClient: SupabaseClient | null = null;

/**
 * Browser client (singleton). Returns null if Supabase is not configured.
 * Used by client components that need real-time data or to read session info
 * — auth mutations live in Server Actions, not here.
 */
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return browserClient;
}
