"use client";

import Link from "next/link";
import { ArrowUpRight, Pause, Timer, Zap } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Watch, WatchStatus } from "@/lib/supabase/types";
import { formatDateTime, formatPrice, shortHost } from "@/lib/utils";
import { stagger, listItem } from "@/lib/animations";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<WatchStatus, string> = {
  IN_STOCK: "En stock",
  OUT_OF_STOCK: "Rupture",
  UNKNOWN: "En attente",
};

function urgencyMinutes(lastCheck: string | null): number | null {
  if (!lastCheck) return null;
  return (Date.now() - new Date(lastCheck).getTime()) / 60_000;
}

function StatusBadge({ status }: { status: WatchStatus }) {
  if (status === "IN_STOCK") {
    return (
      <Badge
        variant="success"
        className="animate-pulse gap-1.5 border border-emerald-400/60 bg-emerald-100 text-emerald-800"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        {STATUS_LABEL[status]}
      </Badge>
    );
  }
  if (status === "OUT_OF_STOCK") {
    return (
      <Badge variant="warning" className="gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {STATUS_LABEL[status]}
      </Badge>
    );
  }
  return (
    <Badge variant="muted" className="gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function WatchListSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-20 w-20 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </Card>
      ))}
    </div>
  );
}

interface WatchListProps {
  watches: Watch[];
}

export function WatchList({ watches }: WatchListProps) {
  // Sort: IN_STOCK first, then by recency
  const sorted = [...watches].sort((a, b) => {
    if (a.last_status === "IN_STOCK" && b.last_status !== "IN_STOCK") return -1;
    if (a.last_status !== "IN_STOCK" && b.last_status === "IN_STOCK") return 1;
    const aTime = a.last_check ? new Date(a.last_check).getTime() : 0;
    const bTime = b.last_check ? new Date(b.last_check).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <motion.div
      className="grid gap-4"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {sorted.map((w) => {
        const isInStock = w.last_status === "IN_STOCK" && w.is_active;
        const isOutOfStock = w.last_status === "OUT_OF_STOCK" && w.is_active;
        const isPaused = !w.is_active;
        const minsAgo = urgencyMinutes(w.last_check);

        return (
          <motion.div key={w.id} variants={listItem}>
            <Link
              href={`/dashboard/watches/${w.id}`}
              className="group block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
            >
              <Card
                className={cn(
                  "relative flex flex-col gap-3 p-4 transition-all duration-300 sm:flex-row sm:items-center",
                  "hover:shadow-brutal-sm hover:-translate-y-0.5",
                  // In stock: urgent green glow
                  isInStock &&
                    "border-emerald-400/60 bg-emerald-50/20 shadow-[0_0_20px_rgba(16,185,129,0.08)]",
                  // Out of stock: subtle
                  isOutOfStock && "border-ink/20",
                  // Paused: muted
                  isPaused && "opacity-60",
                )}
              >
                {/* In-stock glow pulse */}
                {isInStock && (
                  <span className="absolute inset-0 rounded-2xl animate-pulse bg-emerald-400/5 pointer-events-none" />
                )}

                {/* Mobile: image + badge row | Desktop: image only */}
                <div className="flex items-start gap-3 sm:contents">
                  <div
                    className={cn(
                      "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-24 sm:w-24",
                      isInStock && "ring-2 ring-emerald-400/60 ring-offset-2 ring-offset-cream",
                    )}
                  >
                    {w.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={w.image_url}
                        alt={w.name ?? "Produit"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        Sans visuel
                      </div>
                    )}
                  </div>

                  {/* Badge — visible on mobile next to image, on desktop at the end */}
                  <div className="shrink-0 sm:hidden">
                    {isPaused ? (
                      <Badge variant="muted" className="gap-1.5">
                        <Pause className="h-3 w-3" />
                        En pause
                      </Badge>
                    ) : (
                      <StatusBadge status={w.last_status} />
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={cn(
                        "truncate font-display text-base font-semibold leading-tight sm:text-lg",
                        isInStock && "text-emerald-900",
                      )}
                    >
                      {w.name ?? "Produit sans titre"}
                    </p>
                    <ArrowUpRight
                      className={cn(
                        "mt-1 hidden h-4 w-4 shrink-0 transition-all sm:block",
                        isInStock
                          ? "text-emerald-600 opacity-70"
                          : "text-muted-foreground opacity-0 group-hover:opacity-100",
                      )}
                    />
                  </div>
                  <p className="truncate text-xs text-muted-foreground sm:text-sm">
                    {shortHost(w.url)} · {w.variant_label ?? "Variante non définie"}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
                    <span className="font-medium">{formatPrice(w.price)}</span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Timer className="h-3 w-3" />
                      {formatDateTime(w.last_check)}
                    </span>
                    {isInStock && minsAgo !== null && minsAgo < 10 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-orange)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-orange)]">
                        <Zap className="h-2.5 w-2.5" />
                        {minsAgo < 1 ? "À l'instant" : `Il y a ${Math.round(minsAgo)} min`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Badge — desktop only */}
                <div className="hidden shrink-0 sm:block">
                  {isPaused ? (
                    <Badge variant="muted" className="gap-1.5">
                      <Pause className="h-3 w-3" />
                      En pause
                    </Badge>
                  ) : (
                    <StatusBadge status={w.last_status} />
                  )}
                </div>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export { StatusBadge };
