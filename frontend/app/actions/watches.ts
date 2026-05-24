"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PLAN_LIMITS, type Subscription, type Watch } from "@/lib/supabase/types";
import { getSubscription, getWatches } from "@/lib/data/watches";
import { createClient } from "@/lib/supabase/server";

// ---------- Types ----------

export type AnalyzeResult = {
  ok: boolean;
  url: string;
  name: string | null;
  image_url: string | null;
  price: number | null;
  variants: string[];
  error?: "FETCH_FAILED" | "INVALID_URL" | "TIMEOUT";
};

export type CreateWatchInput = {
  url: string;
  name: string | null;
  image_url: string | null;
  price: number | null;
  variant_label: string | null;
  variant_id: string | null;
};

export type CreateWatchResult =
  | { ok: true; id: string }
  | { ok: false; error: "LIMIT_REACHED" | "INVALID_URL" | "UNKNOWN"; plan?: Subscription["plan"] };

// ---------- Helpers ----------

const SIZE_TOKENS = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  ...Array.from({ length: 17 }, (_, i) => String(34 + i)), // 34..50
];

function safeUrl(input: string): URL | null {
  try {
    const u = new URL(input);
    if (!/^https?:$/.test(u.protocol)) return null;
    return u;
  } catch {
    return null;
  }
}

function pickMeta(html: string, prop: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const m = html.match(re);
  return m?.[1] ?? null;
}

function pickPrice(html: string): number | null {
  const candidates = [
    pickMeta(html, "og:price:amount"),
    pickMeta(html, "product:price:amount"),
    pickMeta(html, "price"),
  ].filter(Boolean) as string[];

  for (const raw of candidates) {
    const n = Number(raw.replace(",", "."));
    if (!Number.isNaN(n)) return n;
  }
  // fallback: regex sur "€"
  const m = html.match(/(\d{1,4}(?:[.,]\d{2})?)\s*€/);
  if (m) {
    const n = Number(m[1].replace(",", "."));
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

function extractVariants(html: string): string[] {
  const found = new Set<string>();
  // Tokens de tailles trouvés tels quels
  for (const token of SIZE_TOKENS) {
    const re = new RegExp(
      `(?:>\\s*${token}\\s*<|data-size=["']${token}["']|aria-label=["'][^"']*${token}[^"']*["'])`,
      "g",
    );
    if (re.test(html)) found.add(token);
  }
  // data-color
  const colorRe = /data-color=["']([^"']{1,32})["']/gi;
  let m: RegExpExecArray | null;
  while ((m = colorRe.exec(html)) !== null) {
    found.add(m[1].trim());
    if (found.size > 24) break;
  }
  return Array.from(found).slice(0, 18);
}

// ---------- Actions ----------

export async function analyzeUrl(url: string): Promise<AnalyzeResult> {
  const parsed = safeUrl(url);
  if (!parsed) {
    return {
      ok: false,
      url,
      name: null,
      image_url: null,
      price: null,
      variants: [],
      error: "INVALID_URL",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6500);

  try {
    const res = await fetch(parsed.toString(), {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        ok: false,
        url: parsed.toString(),
        name: null,
        image_url: null,
        price: null,
        variants: [],
        error: "FETCH_FAILED",
      };
    }

    const html = await res.text();
    const name = pickMeta(html, "og:title");
    const image_url = pickMeta(html, "og:image");
    const price = pickPrice(html);
    const variants = extractVariants(html);

    return {
      ok: true,
      url: parsed.toString(),
      name,
      image_url,
      price,
      variants,
    };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      url: parsed.toString(),
      name: null,
      image_url: null,
      price: null,
      variants: [],
      error: aborted ? "TIMEOUT" : "FETCH_FAILED",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function createWatch(
  input: CreateWatchInput,
): Promise<CreateWatchResult> {
  const parsed = safeUrl(input.url);
  if (!parsed) return { ok: false, error: "INVALID_URL" };

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "UNKNOWN" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "UNKNOWN" };

  const [subscription, existing] = await Promise.all([
    getSubscription(),
    getWatches(),
  ]);
  const max = PLAN_LIMITS[subscription.plan];
  const active = existing.filter((w: Watch) => w.is_active).length;
  if (active >= max) {
    return { ok: false, error: "LIMIT_REACHED", plan: subscription.plan };
  }

  const { data, error } = await supabase
    .from("watches")
    .insert({
      user_id: user.id,
      url: parsed.toString(),
      name: input.name,
      image_url: input.image_url,
      price: input.price,
      variant_label: input.variant_label,
      variant_id: input.variant_id,
      last_status: "UNKNOWN",
      is_active: true,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("createWatch error", error);
    return { ok: false, error: "UNKNOWN" };
  }

  revalidatePath("/dashboard");
  return { ok: true, id: (data as { id: string }).id };
}

export async function toggleWatch(
  id: string,
  is_active: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!id) return { ok: false, error: "INVALID_ID" };
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "DB_ERROR" };

  const { error } = await supabase
    .from("watches")
    .update({ is_active })
    .eq("id", id);

  if (error) {
    console.error("toggleWatch error", error);
    return { ok: false, error: "DB_ERROR" };
  }

  revalidatePath(`/dashboard/watches/${id}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteWatch(id: string): Promise<void> {
  if (!id) return;
  const supabase = await createClient();
  if (!supabase) return;

  const { error } = await supabase.from("watches").delete().eq("id", id);
  if (error) {
    console.error("deleteWatch error", error);
  }
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
