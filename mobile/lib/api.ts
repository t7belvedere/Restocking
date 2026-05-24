import { supabase } from "./supabase";

const WORKER_URL =
  process.env.EXPO_PUBLIC_WORKER_URL || "https://worker.restocking.app";
const FRONTEND_URL =
  process.env.EXPO_PUBLIC_FRONTEND_URL || "https://restocking.app";

export interface AnalyzeResult {
  ok: boolean;
  name?: string;
  image_url?: string;
  price?: number;
  currency?: string;
  variants?: Array<{ label: string; in_stock: boolean }>;
  enrichment_pending?: boolean;
  error?: string;
}

export async function analyzeUrl(url: string): Promise<AnalyzeResult> {
  const res = await fetch(
    `${WORKER_URL}/analyze?url=${encodeURIComponent(url)}`,
  );
  if (!res.ok) {
    return { ok: false, error: `Worker returned ${res.status}` };
  }
  return res.json();
}

export async function deleteAccount(): Promise<{ ok: boolean; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return { ok: false, error: "Not authenticated" };
  }

  const res = await fetch(`${FRONTEND_URL}/api/auth/delete-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: (err as any)?.error ?? `HTTP ${res.status}` };
  }
  return { ok: true };
}
