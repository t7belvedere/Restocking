"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Watch = Database["public"]["Tables"]["watches"]["Row"];

interface WatchListProps {
  watches: Watch[];
  plan: "free" | "pro";
  maxWatches: number;
}

function StatusBadge({ status }: { status: Watch["last_status"] }) {
  if (status === "IN_STOCK") {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
        En stock
      </Badge>
    );
  }
  if (status === "OUT_OF_STOCK") {
    return (
      <Badge variant="secondary">
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-gray-400 inline-block" />
        Épuisé
      </Badge>
    );
  }
  return (
    <Badge variant="outline">
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-yellow-400 inline-block" />
      En attente
    </Badge>
  );
}

function EmptyState({
  plan,
  maxWatches,
}: {
  plan: "free" | "pro";
  maxWatches: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="rounded-full bg-muted p-6">
        <BellIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="text-lg font-semibold">Aucun produit surveillé</h2>
        <p className="text-sm text-muted-foreground">
          Colle l&apos;URL d&apos;un produit en rupture, choisis ta taille — on
          t&apos;alerte dès qu&apos;il revient en stock.
        </p>
        <p className="text-xs text-muted-foreground">
          Plan {plan === "pro" ? "Pro" : "Free"} — jusqu&apos;à {maxWatches}{" "}
          produits
        </p>
      </div>
      <Link href="/dashboard/add" className={buttonVariants()}>
        Ajouter mon premier produit
      </Link>
    </div>
  );
}

export default function WatchList({ watches, plan, maxWatches }: WatchListProps) {
  if (watches.length === 0) {
    return <EmptyState plan={plan} maxWatches={maxWatches} />;
  }

  return (
    <div className="space-y-3">
      {watches.map((watch) => (
        <WatchCard key={watch.id} watch={watch} />
      ))}

      {plan === "free" && watches.length >= maxWatches && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <p className="text-sm font-medium">
              Tu as atteint la limite du plan Free ({maxWatches} produits)
            </p>
            <Link
              href="/upgrade"
              className={buttonVariants({ size: "sm" })}
            >
              Passer à Pro — 20 produits, check toutes les 5 min
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function WatchCard({ watch }: { watch: Watch }) {
  const domain = (() => {
    try {
      return new URL(watch.url).hostname.replace("www.", "");
    } catch {
      return watch.url;
    }
  })();

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {watch.image_url ? (
            <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
              <Image
                src={watch.image_url}
                alt={watch.name ?? "Produit"}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          ) : (
            <div className="h-16 w-16 flex-shrink-0 rounded-md bg-muted flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">
                  {watch.name ?? "Produit sans nom"}
                </p>
                <p className="text-xs text-muted-foreground truncate">{domain}</p>
              </div>
              <StatusBadge status={watch.last_status} />
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {watch.variant_label && (
                <span className="bg-muted px-2 py-0.5 rounded-full">
                  {watch.variant_label}
                </span>
              )}
              {watch.price && <span>{watch.price.toFixed(2)} €</span>}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {watch.last_check ? (
              <span className="text-xs text-muted-foreground">
                Vérifié{" "}
                {formatDistanceToNow(new Date(watch.last_check), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Pas encore vérifié
              </span>
            )}
            <Link
              href={`/dashboard/watches/${watch.id}`}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Détails
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WatchListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
      />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
      />
    </svg>
  );
}
