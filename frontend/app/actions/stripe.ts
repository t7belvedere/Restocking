"use server";

import { redirect } from "next/navigation";
import { stripe, PRICE_IDS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/env";

export async function createCheckoutSession(interval: "monthly" | "annual") {
  const supabase = await createClient();
  if (!supabase) throw new Error("Auth non configurée");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const priceId = PRICE_IDS[interval];
  const siteUrl = getSiteUrl();

  // Récupérer ou créer le customer Stripe
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  let customerId = sub?.stripe_customer_id as string | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("subscriptions")
      .upsert({ user_id: user.id, stripe_customer_id: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/dashboard?upgrade=success`,
    cancel_url: `${siteUrl}/upgrade`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
  });

  redirect(session.url!);
}

export async function createPortalSession() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Auth non configurée");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!sub?.stripe_customer_id) redirect("/upgrade");

  const siteUrl = getSiteUrl();
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id as string,
    return_url: `${siteUrl}/dashboard`,
  });

  redirect(session.url);
}
