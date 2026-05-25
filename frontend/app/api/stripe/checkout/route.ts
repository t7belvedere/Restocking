import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICE_IDS } from "@/lib/stripe";
import { createRouteHandlerClient, createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { priceId } = body as { priceId: string };

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    const response = NextResponse.json({});
    let userId: string | undefined;
    let userEmail: string | undefined;

    // Try Bearer token first (mobile app), then fall back to cookies (web)
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
      }
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = user.id;
      userEmail = user.email;
    } else {
      const supabase = createRouteHandlerClient(req, response);
      if (!supabase) {
        return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = user.id;
      userEmail = user.email;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create Stripe customer
    const adminClient = createAdminClient();
    const { data: sub } = await adminClient!
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    let customerId = sub?.stripe_customer_id as string | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail!,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;
      await adminClient!
        .from("subscriptions")
        .upsert({ user_id: userId, stripe_customer_id: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: "restocking://upgrade/success",
      cancel_url: "restocking://upgrade/cancel",
      metadata: { supabase_user_id: userId },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("checkout API error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal error" },
      { status: 500 },
    );
  }
}
