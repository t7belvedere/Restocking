"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/site/locale-provider";
import { Zap } from "lucide-react";
import type { WatchStatus } from "@/lib/supabase/types";

type RT = { now?: string; sec: (n: number) => string; min: (n: number) => string; hour: (n: number) => string; day: (n: number) => string };

function useRelativeTime(iso: string | null, rt: RT, never: string): string {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  if (!iso) return never;

  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return rt.sec(sec);
  const min = Math.floor(sec / 60);
  if (min < 60) return rt.min(min);
  const hours = Math.floor(min / 60);
  if (hours < 24) return rt.hour(hours);
  const days = Math.floor(hours / 24);
  return rt.day(days);
}

function freshness(iso: string | null): "live" | "warm" | "cold" {
  if (!iso) return "cold";
  const diff = Date.now() - new Date(iso).getTime();
  const min = diff / 60_000;
  if (min < 8) return "live";
  if (min < 40) return "warm";
  return "cold";
}

export function LiveStatus({
  lastCheck,
  status,
  isActive,
}: {
  lastCheck: string | null;
  status: WatchStatus;
  isActive: boolean;
}) {
  const { t } = useLocale();
  const td = t.watchDetail;
  const relative = useRelativeTime(lastCheck, td.relativeTime, td.neverChecked);
  const fresh = freshness(lastCheck);
  const isInStock = status === "IN_STOCK";

  const STATUS_LABEL: Record<WatchStatus, string> = {
    IN_STOCK: td.inStock,
    OUT_OF_STOCK: td.outOfStock,
    UNKNOWN: td.pending,
  };

  if (!isActive) {
    return (
      <div className="flex items-center gap-2.5 rounded-full border-2 border-ink/15 bg-muted/40 px-4 py-1.5">
        <span className="flex h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        <span className="text-sm font-medium text-muted-foreground">{td.paused}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-full border-2 px-4 py-1.5 transition-all duration-500",
        isInStock && fresh === "live"
          ? "border-emerald-400/60 bg-emerald-50 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
          : "border-ink/20 bg-cream",
      )}
    >
      <span className="relative flex h-2.5 w-2.5">
        {isInStock && fresh === "live" ? (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40 animation-delay-500" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </>
        ) : (
          <>
            <span
              className={cn(
                "absolute inset-0 rounded-full",
                isInStock && fresh === "live"
                  ? "animate-ping bg-emerald-400/60"
                  : status === "OUT_OF_STOCK" && fresh !== "cold"
                    ? "animate-ping bg-amber-400/40"
                    : "",
              )}
            />
            <span
              className={cn(
                "relative inline-flex h-2.5 w-2.5 rounded-full",
                isInStock
                  ? "bg-emerald-500"
                  : status === "OUT_OF_STOCK"
                    ? "bg-amber-500"
                    : "bg-muted-foreground/40",
              )}
            />
          </>
        )}
      </span>

      <span
        className={cn(
          "text-sm font-medium",
          isInStock && fresh === "live" ? "text-emerald-800" : "text-ink/80",
        )}
      >
        {STATUS_LABEL[status]}
      </span>

      {isInStock && fresh === "live" && (
        <Zap className="h-3.5 w-3.5 text-[var(--brand-orange)] animate-pulse shrink-0" />
      )}

      <span className="text-xs text-ink/40">·</span>
      <span
        className={cn(
          "font-mono text-xs",
          isInStock && fresh === "live"
            ? "text-emerald-700"
            : status === "OUT_OF_STOCK" && fresh !== "cold"
              ? "text-amber-700"
              : "text-ink/40",
        )}
      >
        {td.lastCheck} {relative}
      </span>
    </div>
  );
}
