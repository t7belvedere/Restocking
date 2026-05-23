export type WatchStatus = "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";

export type Watch = {
  id: string;
  user_id: string;
  url: string;
  name: string | null;
  image_url: string | null;
  price: number | null;
  variant_label: string | null;
  variant_id: string | null;
  last_status: WatchStatus;
  last_check: string | null;
  is_active: boolean;
  created_at: string;
};

export type Subscription = {
  plan: "free" | "pro";
  stripe_sub_id: string | null;
  current_period_end: string | null;
};

export type CheckLog = {
  id: string;
  watch_id: string;
  status: WatchStatus;
  price: number | null;
  signal_source:
    | "dataLayer"
    | "add_to_cart_btn"
    | "variant_attr"
    | "playwright"
    | null;
  raw_signal: string | null;
  checked_at: string;
};

export const PLAN_LIMITS: Record<Subscription["plan"], number> = {
  free: 3,
  pro: 20,
};
