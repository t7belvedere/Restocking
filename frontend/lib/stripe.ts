import Stripe from "stripe";

let _stripe: Stripe | null = null;

// ponytail: lazy init — avoids build crash when STRIPE_SECRET_KEY is missing
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    if (!_stripe) {
      _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2026-04-22.dahlia" as const,
      });
    }
    return (_stripe as any)[prop];
  },
});

export const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  annual: process.env.STRIPE_PRICE_ANNUAL!,
} as const;
