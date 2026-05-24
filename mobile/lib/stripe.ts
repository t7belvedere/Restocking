import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "./supabase";

const FRONTEND_URL =
  process.env.EXPO_PUBLIC_FRONTEND_URL || "https://restocking.app";

// Price IDs — monthly / annual from env
export const PRICE_IDS = {
  monthly: process.env.EXPO_PUBLIC_STRIPE_PRICE_MONTHLY || "",
  annual: process.env.EXPO_PUBLIC_STRIPE_PRICE_ANNUAL || "",
} as const;

/**
 * Create a Stripe Checkout Session via the frontend API and open it in-browser.
 * Returns after the browser closes (cancelled or completed).
 */
export async function openCheckout(
  priceId: string,
): Promise<{ success: boolean; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return { success: false, error: "Not authenticated" };
  }

  const res = await fetch(`${FRONTEND_URL}/api/stripe/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ priceId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return {
      success: false,
      error: (err as any)?.error ?? `HTTP ${res.status}`,
    };
  }

  const { url } = (await res.json()) as { url?: string };
  if (!url) return { success: false, error: "No checkout URL returned" };

  const redirectUrl = Linking.createURL("/settings");

  if (Platform.OS === "web") {
    window.location.href = url;
    return { success: true };
  }

  const result = await WebBrowser.openAuthSessionAsync(url, redirectUrl);

  if (result.type === "cancel") {
    return { success: false, error: "Cancelled" };
  }

  return { success: true };
}

/**
 * Open the Stripe Customer Portal to manage subscription.
 */
export async function openPortal(): Promise<{ success: boolean; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return { success: false, error: "Not authenticated" };
  }

  const res = await fetch(`${FRONTEND_URL}/api/stripe/portal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return {
      success: false,
      error: (err as any)?.error ?? `HTTP ${res.status}`,
    };
  }

  const { url } = (await res.json()) as { url?: string };
  if (!url) return { success: false, error: "No portal URL returned" };

  if (Platform.OS === "web") {
    window.location.href = url;
    return { success: true };
  }

  await WebBrowser.openBrowserAsync(url);
  return { success: true };
}

export interface SubscriptionInfo {
  plan: "free" | "pro";
  stripe_sub_id: string | null;
  stripe_customer_id: string | null;
  current_period_end: string | null;
}

export async function getSubscription(): Promise<SubscriptionInfo> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { plan: "free", stripe_sub_id: null, stripe_customer_id: null, current_period_end: null };

  const { data } = await supabase
    .from("subscriptions")
    .select("plan, stripe_sub_id, stripe_customer_id, current_period_end")
    .eq("user_id", user.id)
    .single();

  return data ?? { plan: "free", stripe_sub_id: null, stripe_customer_id: null, current_period_end: null };
}
