import { redirect } from "next/navigation";
import { AddWatchCard } from "@/components/dashboard/add-watch-card";
import { getSubscription, getWatches } from "@/lib/data/watches";
import { PLAN_LIMITS } from "@/lib/supabase/types";

export default async function AddWatchPage() {
  const [watches, subscription] = await Promise.all([
    getWatches(),
    getSubscription(),
  ]);
  const max = PLAN_LIMITS[subscription.plan];
  const active = watches.filter((w) => w.is_active).length;
  if (active >= max) {
    redirect("/upgrade");
  }

  return <AddWatchCard />;
}
