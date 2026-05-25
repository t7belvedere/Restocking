import type { AnalyzeResult } from "@/app/actions/watches";

export type ProgressStep =
  | "http"
  | "playwright"
  | "playwright_retry"
  | "extracting";

export type ProgressEvent = {
  step: ProgressStep;
  message: string;
};

const WORKER_URL =
  process.env.NEXT_PUBLIC_WORKER_API_URL ||
  "https://restocking-production.up.railway.app";

/**
 * Call the worker /analyze endpoint with SSE streaming.
 * Calls `onProgress` for each real step the worker sends,
 * then resolves with the final AnalyzeResult.
 */
export async function analyzeUrlStream(
  url: string,
  onProgress: (event: ProgressEvent) => void,
): Promise<AnalyzeResult> {
  const apiUrl = new URL("/analyze", WORKER_URL);
  apiUrl.searchParams.set("url", url);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 40000);

  try {
    const res = await fetch(apiUrl.toString(), {
      signal: controller.signal,
      headers: { Accept: "text/event-stream" },
      cache: "no-store",
    });

    if (!res.ok || !res.body) {
      return emptyResult(url, "FETCH_FAILED");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse complete SSE events from the buffer
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? ""; // keep incomplete event in buffer

      for (const part of parts) {
        if (!part.trim()) continue;
        const parsed = parseSSE(part);
        if (!parsed) continue;

        if (parsed.event === "progress" && parsed.data) {
          onProgress(parsed.data as ProgressEvent);
        } else if (parsed.event === "result" && parsed.data) {
          return mapResult(parsed.data as Record<string, unknown>);
        } else if (parsed.event === "error") {
          return emptyResult(url, "FETCH_FAILED");
        }
      }
    }

    return emptyResult(url, "FETCH_FAILED");
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return emptyResult(url, aborted ? "TIMEOUT" : "FETCH_FAILED");
  } finally {
    clearTimeout(timer);
  }
}

function parseSSE(
  chunk: string,
): { event: string; data: unknown } | null {
  let event = "";
  let data = "";
  for (const line of chunk.split("\n")) {
    if (line.startsWith("event: ")) {
      event = line.slice(7).trim();
    } else if (line.startsWith("data: ")) {
      data = line.slice(6);
    }
  }
  if (!event || !data) return null;
  try {
    return { event, data: JSON.parse(data) };
  } catch {
    return null;
  }
}

function mapResult(data: Record<string, unknown>): AnalyzeResult {
  return {
    ok: data.ok === true,
    url: (data.url as string) ?? "",
    name: (data.name as string) ?? null,
    image_url: (data.image_url as string) ?? null,
    image_base64: (data.image_base64 as string) ?? null,
    price: (data.price as number) ?? null,
    variants: Array.isArray(data.variants) ? (data.variants as string[]) : [],
    sizes: Array.isArray(data.sizes) ? (data.sizes as string[]) : [],
    colors: Array.isArray(data.colors) ? (data.colors as string[]) : [],
    sizes_status: (data.sizes_status as Record<string, boolean>) ?? {},
    colors_status: (data.colors_status as Record<string, boolean>) ?? {},
    variants_status: (data.variants_status as Record<string, boolean>) ?? {},
  };
}

function emptyResult(
  url: string,
  error: "FETCH_FAILED" | "TIMEOUT",
): AnalyzeResult {
  return {
    ok: true,
    url,
    name: null,
    image_url: null,
    price: null,
    variants: [],
    sizes: [],
    colors: [],
    enrichment_pending: true,
    error,
  };
}
