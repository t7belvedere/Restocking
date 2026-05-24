import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import type { Stripe } from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 500 });

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Record<string, any>;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;

      const plan = sub.status === "active" || sub.status === "trialing" ? "pro" : "free";
      const periodEnd = sub.current_period_end
        ? new Date((sub.current_period_end as number) * 1000).toISOString()
        : null;

      await supabase.from("subscriptions").upsert({
        user_id: userId,
        plan,
        stripe_sub_id: sub.id,
        stripe_customer_id: sub.customer as string,
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Record<string, any>;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;

      await supabase.from("subscriptions").upsert({
        user_id: userId,
        plan: "free",
        stripe_sub_id: null,
        current_period_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const userId = session.metadata?.supabase_user_id
        ?? (session as unknown as { subscription_data?: { metadata?: { supabase_user_id?: string } } }).subscription_data?.metadata?.supabase_user_id;

      if (!userId && session.customer) {
        const { data } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", session.customer as string)
          .single();
        if (data) {
          await supabase.from("subscriptions").upsert({
            user_id: data.user_id,
            plan: "pro",
            stripe_sub_id: session.subscription as string,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
