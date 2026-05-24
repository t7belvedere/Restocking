export interface Watch {
  id: string;
  user_id: string;
  url: string;
  name: string;
  image_url?: string | null;
  size_label?: string | null;
  color_label?: string | null;
  price?: number | null;
  currency?: string;
  in_stock: boolean;
  enrichment_pending: boolean;
  last_checked_at?: string | null;
  created_at: string;
}

export interface AnalyzeResult {
  ok: boolean;
  name?: string;
  image_url?: string;
  price?: number;
  currency?: string;
  variants?: ProductVariant[];
  enrichment_pending?: boolean;
  error?: string;
}

export interface ProductVariant {
  label: string;
  in_stock: boolean;
}

export type SubscriptionPlan = "free" | "pro";

export interface UserProfile {
  id: string;
  email: string;
  plan: SubscriptionPlan;
}
