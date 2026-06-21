"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Watch } from "@/lib/supabase/types";

export async function getAllWatches(): Promise<Watch[]> {
  const adminClient = createAdminClient();
  if (!adminClient) return [];

  // Admin client bypasses RLS — sees all watches
  const { data, error } = await adminClient
    .from("watches")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllWatches error:", error);
    return [];
  }
  return (data ?? []) as Watch[];
}

export async function toggleWatch(watchId: string, isActive: boolean) {
  const adminClient = createAdminClient();
  if (!adminClient) return;

  await adminClient
    .from("watches")
    .update({ is_active: isActive })
    .eq("id", watchId);

  revalidatePath("/admin/watches");
}

export async function deleteWatch(watchId: string) {
  const adminClient = createAdminClient();
  if (!adminClient) return;

  // Delete check_logs first (FK constraint)
  await adminClient.from("check_logs").delete().eq("watch_id", watchId);
  await adminClient.from("notifications").delete().eq("watch_id", watchId);
  await adminClient.from("watches").delete().eq("id", watchId);

  revalidatePath("/admin/watches");
}
