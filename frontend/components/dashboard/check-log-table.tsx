"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { type WatchStatus } from "@/lib/supabase/types";
import type { CheckLog } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type TFunc = (key: string, values?: Record<string, string | number | Date>) => string;

function relativeTimeStr(iso: string, t: TFunc): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 10) return t("watchDetail.relativeTime.now");
  if (sec < 60) return t("watchDetail.relativeTime.sec", { n: sec });
  const min = Math.floor(sec / 60);
  if (min < 60) return t("watchDetail.relativeTime.min", { n: min });
  const hours = Math.floor(min / 60);
  if (hours < 24) return t("watchDetail.relativeTime.hour", { n: hours });
  return t("watchDetail.relativeTime.day", { n: Math.floor(hours / 24) });
}

function RelativeTimeCell({ iso }: { iso: string }) {
  const t = useTranslations();
  const [label, setLabel] = useState(() => relativeTimeStr(iso, t));

  useEffect(() => {
    const id = setInterval(() => setLabel(relativeTimeStr(iso, t)), 15_000);
    return () => clearInterval(id);
  }, [iso, t]);

  return (
    <time dateTime={iso} className="font-mono text-[11px] text-ink/40 tabular-nums">
      {label}
    </time>
  );
}

function sourceLabel(source: string | null, labels: Record<string, string>): string {
  if (!source) return "—";
  return labels[source] ?? source;
}

function sourceIcon(source: string | null): string {
  switch (source) {
    case "dataLayer":
      return "{ }";
    case "add_to_cart_btn":
      return "🛒";
    case "variant_attr":
      return "📐";
    case "playwright":
      return "🌐";
    default:
      return "·";
  }
}

export function CheckLogTable({ logs, watchPrice }: { logs: CheckLog[]; watchPrice?: number | null }) {
  const t = useTranslations();

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-ink/20 bg-cream/50 p-10 text-center">
        <span className="relative flex h-4 w-4">
          <span className="absolute inset-0 animate-ping rounded-full bg-[var(--brand-orange)]/40" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-[var(--brand-orange)]" />
        </span>
        <p className="text-sm font-medium text-ink/60">{t("watchDetail.emptyCheckTitle")}</p>
        <p className="max-w-xs text-xs text-ink/40">{t("watchDetail.emptyCheckBody")}</p>
      </div>
    );
  }

  const STATUS_LABEL: Record<WatchStatus, string> = {
    IN_STOCK: t("watchDetail.inStock"),
    OUT_OF_STOCK: t("watchDetail.outOfStock"),
    UNKNOWN: t("watchDetail.pending"),
  };

  const SOURCE_LABEL: Record<string, string> = {
    dataLayer: t("watchDetail.sourceDataLayer"),
    add_to_cart_btn: t("watchDetail.sourceAddToCart"),
    variant_attr: t("watchDetail.sourceVariant"),
    playwright: t("watchDetail.sourcePlaywright"),
  };

  return (
    <div className="rounded-2xl border-2 border-ink/20 bg-card overflow-hidden">
      <div className="px-5 py-4 sm:px-6">
        <div className="space-y-0">
          {logs.map((log, i) => {
            const isInStock = log.status === "IN_STOCK";
            const isOutOfStock = log.status === "OUT_OF_STOCK";
            const prevLog = logs[i + 1];
            const statusChanged = prevLog && prevLog.status !== log.status;
            const priceChanged =
              prevLog && log.price != null && prevLog.price != null && log.price !== prevLog.price;
            const priceDiff =
              priceChanged && prevLog && log.price != null && prevLog.price != null
                ? log.price - prevLog.price
                : 0;

            return (
              <div
                key={log.id}
                className="flex gap-4 animate-[rise-in_400ms_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0"
                style={{ animationDelay: `${Math.min(i * 50, 800)}ms` }}
              >
                {/* Timeline node + vertical line connector */}
                <div className="relative flex flex-col items-center shrink-0">
                  {/* Line above (connects from previous node) — hidden for first item */}
                  {i > 0 && (
                    <div className="w-0.5 h-4 bg-ink/8 -mt-4" />
                  )}
                  {/* Node */}
                  <div
                    className={cn(
                      "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-card sm:h-9 sm:w-9",
                      isInStock &&
                        "border-emerald-400 bg-emerald-100 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
                      isOutOfStock && "border-amber-300 bg-amber-50",
                      !isInStock && !isOutOfStock && "border-ink/15 bg-muted/50",
                    )}
                  >
                    {isInStock ? (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/50" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      </span>
                    ) : isOutOfStock ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                    )}
                  </div>
                  {/* Line below */}
                  <div className="w-0.5 flex-1 bg-ink/8 min-h-4" />
                </div>

                {/* Content */}
                <div
                  className={cn(
                    "min-w-0 flex-1 rounded-xl px-3.5 py-2.5 mb-4 transition-colors",
                    isInStock && "bg-emerald-50/60",
                    statusChanged && isInStock && "bg-emerald-100/80 ring-1 ring-emerald-400/30",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          isInStock &&
                            "bg-emerald-200/70 text-emerald-800",
                          isOutOfStock &&
                            "bg-amber-100 text-amber-800",
                          !isInStock && !isOutOfStock &&
                            "bg-muted text-ink/50",
                        )}
                      >
                        {isInStock && (
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          </span>
                        )}
                        {STATUS_LABEL[log.status]}
                      </span>

                      {statusChanged && (
                        <span className="hidden sm:inline-flex items-center gap-0.5 rounded-full bg-[var(--brand-orange)]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--brand-orange)]">
                          {isInStock ? "▲ Restock!" : "▼ Épuisé"}
                        </span>
                      )}

                      {priceChanged && priceDiff !== 0 && (
                        <span
                          className={cn(
                            "hidden sm:inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest",
                            priceDiff > 0
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700",
                          )}
                        >
                          {priceDiff > 0 ? "▲" : "▼"}{" "}
                          {formatPrice(Math.abs(priceDiff))}
                        </span>
                      )}
                    </div>

                    <RelativeTimeCell iso={log.checked_at} />
                  </div>

                  {/* Source + price row */}
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1 text-[10px] text-ink/40">
                      <span className="font-mono text-[9px] opacity-60">
                        {sourceIcon(log.signal_source)}
                      </span>
                      {sourceLabel(log.signal_source, SOURCE_LABEL)}
                    </span>
                    <span className="font-mono text-xs font-medium tabular-nums text-ink/70">
                      {formatPrice(log.price ?? watchPrice)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
