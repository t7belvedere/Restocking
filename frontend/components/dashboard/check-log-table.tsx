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
import { useLocale } from "@/components/site/locale-provider";
import { type WatchStatus } from "@/lib/supabase/types";
import type { CheckLog } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type RT = { sec: (n: number) => string; min: (n: number) => string; hour: (n: number) => string; day: (n: number) => string; now: string };

function relativeTimeStr(iso: string, rt: RT): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 10) return rt.now;
  if (sec < 60) return rt.sec(sec);
  const min = Math.floor(sec / 60);
  if (min < 60) return rt.min(min);
  const hours = Math.floor(min / 60);
  if (hours < 24) return rt.hour(hours);
  return rt.day(Math.floor(hours / 24));
}

function RelativeTimeCell({ iso }: { iso: string }) {
  const { t } = useLocale();
  const rt = t.watchDetail.relativeTime;
  const [label, setLabel] = useState(() => relativeTimeStr(iso, rt));

  useEffect(() => {
    const id = setInterval(() => setLabel(relativeTimeStr(iso, rt)), 15_000);
    return () => clearInterval(id);
  }, [iso, rt]);

  return (
    <time dateTime={iso} className="font-mono text-xs text-muted-foreground tabular-nums">
      {label}
    </time>
  );
}

function statusVariant(status: WatchStatus) {
  if (status === "IN_STOCK") return "success" as const;
  if (status === "OUT_OF_STOCK") return "warning" as const;
  return "muted" as const;
}

export function CheckLogTable({ logs, watchPrice }: { logs: CheckLog[]; watchPrice?: number | null }) {
  const { t } = useLocale();
  const td = t.watchDetail;

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-ink/20 bg-cream/50 p-10 text-center">
        <span className="relative flex h-4 w-4">
          <span className="absolute inset-0 animate-ping rounded-full bg-[var(--brand-orange)]/40" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-[var(--brand-orange)]" />
        </span>
        <p className="text-sm font-medium text-ink/60">{td.emptyCheckTitle}</p>
        <p className="max-w-xs text-xs text-ink/40">{td.emptyCheckBody}</p>
      </div>
    );
  }

  const STATUS_LABEL: Record<WatchStatus, string> = {
    IN_STOCK: td.inStock,
    OUT_OF_STOCK: td.outOfStock,
    UNKNOWN: td.pending,
  };

  const SOURCE_LABEL: Record<string, string> = {
    dataLayer: td.sourceDataLayer,
    add_to_cart_btn: td.sourceAddToCart,
    variant_attr: td.sourceVariant,
    playwright: td.sourcePlaywright,
  };

  return (
    <div className="overflow-x-auto rounded-2xl border-2 border-ink/20 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-ink/20 bg-cream/70">
            <TableHead className="font-display text-xs font-bold uppercase tracking-widest">
              {td.tableDate}
            </TableHead>
            <TableHead className="font-display text-xs font-bold uppercase tracking-widest">
              {td.tableStatus}
            </TableHead>
            <TableHead className="hidden font-display text-xs font-bold uppercase tracking-widest sm:table-cell">
              {td.tableSource}
            </TableHead>
            <TableHead className="text-right font-display text-xs font-bold uppercase tracking-widest">
              {td.tablePrice}
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
              <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                {log.signal_source
                  ? (SOURCE_LABEL[log.signal_source] ?? log.signal_source)
                  : "—"}
              </TableCell>
              <TableCell className="text-right font-mono text-sm font-medium tabular-nums">
                {formatPrice(log.price ?? watchPrice)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
