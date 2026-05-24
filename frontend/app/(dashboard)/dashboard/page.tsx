import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { WatchList, WatchListSkeleton } from "@/components/dashboard/watch-list";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { cn } from "@/lib/utils";
import { getSubscription, getWatches } from "@/lib/data/watches";
import { PLAN_LIMITS } from "@/lib/supabase/types";

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <AutoRefresh intervalSeconds={60} />
      <DashboardContent />
    </Suspense>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted/70" />
      </div>
      <WatchListSkeleton />
    </div>
  );
}

async function DashboardContent() {
  const [watches, subscription] = await Promise.all([
    getWatches(),
    getSubscription(),
  ]);
  const max = PLAN_LIMITS[subscription.plan];
  const activeCount = watches.filter((w) => w.is_active).length;
  const isLimitReached = activeCount >= max;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Tableau de bord
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Mes alertes
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {activeCount} alerte{activeCount > 1 ? "s" : ""} active
            {activeCount > 1 ? "s" : ""} sur {max} (plan{" "}
            <span className="font-medium capitalize text-foreground">
              {subscription.plan}
            </span>
            )
          </p>
        </div>

        {!isLimitReached ? (
          <Link
            href="/dashboard/add"
            className={cn(buttonVariants({ size: "lg" }), "gap-2")}
          >
            <Plus className="h-4 w-4" />
            Ajouter une alerte
          </Link>
        ) : (
          <Link
            href="/upgrade"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "gap-2",
            )}
          >
            <Sparkles className="h-4 w-4" />
            Limite atteinte — Passer à Pro
          </Link>
        )}
      </header>

      {watches.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {isLimitReached ? (
            <Card className="border-amber-200 bg-amber-50/70">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-amber-900">
                  Vous avez atteint la limite de votre plan{" "}
                  <span className="font-semibold capitalize">
                    {subscription.plan}
                  </span>{" "}
                  ({max} alertes actives). Passez à Pro pour en surveiller
                  jusqu&apos;à 20 simultanément.
                </p>
                <Link
                  href="/upgrade"
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "shrink-0 gap-1.5",
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Passer à Pro
                </Link>
              </CardContent>
            </Card>
          ) : null}
          <WatchList watches={watches} />
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed bg-card/60">
      <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
        <div className="rounded-full bg-accent p-4 text-accent-foreground">
          <Plus className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-semibold">
            Aucune alerte pour le moment
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Collez l&apos;URL d&apos;un produit, choisissez votre taille — on
            vous prévient dès qu&apos;elle revient.
          </p>
        </div>
        <Link
          href="/dashboard/add"
          className={cn(buttonVariants({ size: "lg" }), "gap-2")}
        >
          <Plus className="h-4 w-4" />
          Ajouter ma première alerte
        </Link>
      </CardContent>
    </Card>
  );
}
