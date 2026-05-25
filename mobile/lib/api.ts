import { supabase } from "./supabase";

const WORKER_API_URL = process.env.EXPO_PUBLIC_WORKER_API_URL ?? "https://worker.restocking.app";

export type AnalyzeResult = {
  ok: boolean;
  url: string;
  name?: string | null;
  image_url?: string | null;
  image_base64?: string | null;
  price?: number | null;
  sizes?: string[];
  colors?: string[];
  sizes_status?: Record<string, boolean>;
  colors_status?: Record<string, boolean>;
  variants?: string[];
  enrichment_pending?: boolean;
  error?: string;
};

export async function analyzeUrl(
  url: string,
  onProgress?: (evt: { step: string; message: string }) => void,
): Promise<AnalyzeResult> {
  onProgress?.({ step: "http", message: "Connexion au worker..." });
  try {
    const res = await fetch(`${WORKER_API_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error(`Worker error: ${res.status}`);
    onProgress?.({ step: "extracting", message: "Extraction des données..." });
    return res.json();
  } catch (e) {
    return { ok: false, url, error: (e as Error).message };
  }
}

export async function createWatch(payload: {
  userId: string;
  url: string;
  name?: string | null;
  image_url?: string | null;
  price?: number | null;
  variant_label: string;
  variant_id: string;
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  const { data, error } = await supabase
    .from("watches")
    .insert({
      user_id: payload.userId,
      url: payload.url,
      name: payload.name,
      image_url: payload.image_url,
      price: payload.price,
      variant_label: payload.variant_label,
      variant_id: payload.variant_id,
      last_status: "UNKNOWN",
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { ok: false, error: "DUPLICATE" };
    return { ok: false, error: error.message };
  }
  return { ok: true, id: data.id };
}

export async function getWatches(userId: string) {
  const { data, error } = await supabase
    .from("watches")
    .select("*")
    .eq("user_id", userId)
    .order("last_check", { ascending: false });

  if (error) return [];
  return data;
}

export async function toggleWatch(id: string, userId: string, active: boolean) {
  const { error } = await supabase
    .from("watches")
    .update({ is_active: active })
    .eq("id", id)
    .eq("user_id", userId);

  return !error;
}

export async function deleteWatch(id: string, userId: string) {
  const { error } = await supabase
    .from("watches")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  return !error;
}
