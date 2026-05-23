import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import WatchList from "@/components/dashboard/watch-list";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard — Restocking",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: watches } = await supabase
    .from("watches")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: subData } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .single();

  const plan = ((subData as { plan?: string } | null)?.plan ?? "free") as "free" | "pro";
  const maxWatches = plan === "pro" ? 20 : 3;
  const watchCount = watches?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mes alertes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {watchCount} / {maxWatches} produits surveillés
          </p>
        </div>
        {watchCount < maxWatches && (
          <Link href="/dashboard/add" className={buttonVariants()}>
            + Ajouter un produit
          </Link>
        )}
      </div>

      <WatchList watches={watches ?? []} plan={plan} maxWatches={maxWatches} />
    </div>
  );
}
