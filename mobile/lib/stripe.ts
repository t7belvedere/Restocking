const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

export function getStripePublishableKey(): string {
  return STRIPE_PUBLISHABLE_KEY;
}

const APP_URL = process.env.EXPO_PUBLIC_APP_URL ?? "https://www.restocking.app";

export async function createCheckoutSession(
  accessToken: string,
  priceId: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${APP_URL}/api/stripe/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ priceId }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url ?? null;
  } catch {
    return null;
  }
}

export async function createPortalSession(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${APP_URL}/api/stripe/portal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url ?? null;
  } catch {
    return null;
  }
}
