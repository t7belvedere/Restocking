"use client";

import Link from "next/link";
import { ArrowUpRight, Pause } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Watch, WatchStatus } from "@/lib/supabase/types";
import { formatDateTime, formatPrice, shortHost } from "@/lib/utils";
import { stagger, listItem } from "@/lib/animations";

const STATUS_LABEL: Record<WatchStatus, string> = {
  IN_STOCK: "En stock",
  OUT_OF_STOCK: "Rupture",
  UNKNOWN: "En attente",
};

function StatusBadge({ status }: { status: WatchStatus }) {
  if (status === "IN_STOCK") {
    return (
      <Badge variant="success">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {STATUS_LABEL[status]}
      </Badge>
    );
  }
  if (status === "OUT_OF_STOCK") {
    return (
      <Badge variant="warning">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {STATUS_LABEL[status]}
      </Badge>
    );
  }
  return (
    <Badge variant="muted">
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
  return (
    <motion.div
      className="grid gap-4"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {watches.map((w) => (
        <motion.div key={w.id} variants={listItem}>
          <Link
            href={`/dashboard/watches/${w.id}`}
            className="group rounded-2xl outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="flex flex-col gap-4 p-4 transition-shadow group-hover:shadow-md sm:flex-row sm:items-center">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
              {w.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={w.image_url}
                  alt={w.name ?? "Produit"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  Sans visuel
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between gap-3">
                <p className="truncate font-display text-lg font-semibold leading-tight">
                  {w.name ?? "Produit sans titre"}
                </p>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {shortHost(w.url)} · {w.variant_label ?? "Variante non définie"}
              </p>
              <p className="text-sm">
                <span className="font-medium">{formatPrice(w.price)}</span>
                <span className="ml-2 text-muted-foreground">
                  Vérif. {formatDateTime(w.last_check)}
                </span>
              </p>
            </div>

            <div className="shrink-0">
              {!w.is_active ? (
                <Badge variant="muted">
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
      ))}
    </motion.div>
  );
}

export { StatusBadge };
