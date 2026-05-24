/**
 * Centralised access to Supabase env variables.
 *
 * In Vercel production/preview the user has both NEXT_PUBLIC_SUPABASE_URL
 * and NEXT_PUBLIC_SUPABASE_ANON_KEY set; in the Emergent preview the
 * variables are intentionally blank, so the auth UI degrades gracefully
 * to an "Auth not configured" state instead of crashing.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getSiteUrl(): string {
  // Explicit override always wins.
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;

  // On Vercel (any env — production, preview): use the deployment URL
  // or hard-code production domain when on the main site.
  if (process.env.VERCEL) {
    // Vercel sets VERCEL_URL to the deployment hostname in preview;
    // in production we want the canonical domain.
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
    if (vercelUrl) return `https://${vercelUrl}`;
    return "https://www.restocking.app";
  }

  // Local dev
  return "http://localhost:3000";
}
