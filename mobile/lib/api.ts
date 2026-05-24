const WORKER_URL =
  process.env.EXPO_PUBLIC_WORKER_URL || "https://worker.restocking.app";

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
