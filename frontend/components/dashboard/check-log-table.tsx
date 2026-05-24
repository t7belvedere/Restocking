"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CheckLog, WatchStatus } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Relative time (updates every 15s)                                   */
/* ------------------------------------------------------------------ */

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `il y a ${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

function RelativeTimeCell({ iso }: { iso: string }) {
  const [label, setLabel] = useState(() => relativeTime(iso));

  useEffect(() => {
    const id = setInterval(() => setLabel(relativeTime(iso)), 15_000);
    return () => clearInterval(id);
  }, [iso]);

  return (
    <time dateTime={iso} className="font-mono text-xs text-muted-foreground tabular-nums">
      {label}
    </time>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const STATUS_LABEL: Record<WatchStatus, string> = {
  IN_STOCK: "En stock",
  OUT_OF_STOCK: "Rupture",
  UNKNOWN: "Inconnu",
};

function statusVariant(status: WatchStatus) {
  if (status === "IN_STOCK") return "success" as const;
  if (status === "OUT_OF_STOCK") return "warning" as const;
  return "muted" as const;
}

const SOURCE_LABEL: Record<string, string> = {
  dataLayer: "dataLayer",
  add_to_cart_btn: "Bouton panier",
  variant_attr: "Attribut variante",
  playwright: "Playwright",
};

/* ------------------------------------------------------------------ */
/* Empty state (with pulse animation)                                  */
/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-ink/20 bg-cream/50 p-10 text-center">
      <span className="relative flex h-4 w-4">
        <span className="absolute inset-0 animate-ping rounded-full bg-[var(--brand-orange)]/40" />
        <span className="relative inline-flex h-4 w-4 rounded-full bg-[var(--brand-orange)]" />
      </span>
      <p className="text-sm font-medium text-ink/60">
        En attente du premier check…
      </p>
      <p className="max-w-xs text-xs text-ink/40">
        Le worker va bientôt analyser ce produit. Les résultats apparaîtront ici automatiquement.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function CheckLogTable({ logs }: { logs: CheckLog[] }) {
  if (logs.length === 0) return <EmptyState />;

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-ink/20 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-ink/20 bg-cream/70">
            <TableHead className="font-display text-xs font-bold uppercase tracking-widest">
              Date
            </TableHead>
            <TableHead className="font-display text-xs font-bold uppercase tracking-widest">
              Statut
            </TableHead>
            <TableHead className="font-display text-xs font-bold uppercase tracking-widest">
              Source
            </TableHead>
            <TableHead className="text-right font-display text-xs font-bold uppercase tracking-widest">
              Prix
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log, i) => (
            <TableRow
              key={log.id}
              className={cn(
                "animate-[rise-in_400ms_cubic-bezier(0.16,1,0.3,1)_forwards] border-ink/10 opacity-0",
                log.status === "IN_STOCK" && "bg-emerald-50/60",
              )}
              style={{
                animationDelay: `${Math.min(i * 50, 800)}ms`,
              }}
            >
              <TableCell>
                <RelativeTimeCell iso={log.checked_at} />
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(log.status)} className="rounded-full">
                  {log.status === "IN_STOCK" && (
                    <span className="mr-1 inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  )}
                  {STATUS_LABEL[log.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {log.signal_source
                  ? SOURCE_LABEL[log.signal_source] ?? log.signal_source
                  : "—"}
              </TableCell>
              <TableCell className="text-right font-mono text-sm font-medium tabular-nums">
                {formatPrice(log.price)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
