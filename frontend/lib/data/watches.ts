import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CheckLog, Subscription, Watch } from "@/lib/supabase/types";

async function getAuthedClient() {
  const supabase = await createClient();
  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getWatches(): Promise<Watch[]> {
  const { supabase, user } = await getAuthedClient();
  const { data, error } = await supabase
    .from("watches")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getWatches error", error);
    return [];
  }
  return (data ?? []) as Watch[];
}

export async function getWatch(id: string): Promise<Watch | null> {
  const { supabase, user } = await getAuthedClient();
  const { data, error } = await supabase
    .from("watches")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return null;
  return (data ?? null) as Watch | null;
}

export async function getCheckLogs(watchId: string): Promise<CheckLog[]> {
  const { supabase } = await getAuthedClient();
  const { data, error } = await supabase
    .from("check_logs")
    .select("*")
    .eq("watch_id", watchId)
    .order("checked_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("getCheckLogs error", error);
    return [];
  }
  return (data ?? []) as CheckLog[];
}

export async function getSubscription(): Promise<Subscription> {
  const { supabase, user } = await getAuthedClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, stripe_sub_id, current_period_end")
    .eq("user_id", user.id)
    .single();

  return (data as Subscription | null) ?? {
    plan: "free",
    stripe_sub_id: null,
    current_period_end: null,
  };
}
