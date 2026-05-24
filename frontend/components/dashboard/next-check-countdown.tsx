"use client";

import { useEffect, useState } from "react";
import { Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/site/locale-provider";

interface NextCheckCountdownProps {
  lastCheck: string | null;
  intervalMinutes: number;
  plan: "free" | "pro";
}

export function NextCheckCountdown({ lastCheck, intervalMinutes, plan }: NextCheckCountdownProps) {
  const { locale } = useLocale();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    function tick() {
      if (!lastCheck) {
        setRemaining(0);
        return;
      }
      const last = new Date(lastCheck).getTime();
      const next = last + intervalMinutes * 60 * 1000;
      const left = Math.max(0, Math.floor((next - Date.now()) / 1000));
      setRemaining(left);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastCheck, intervalMinutes]);

  const totalSec = intervalMinutes * 60;
  const progress = remaining !== null ? 1 - remaining / totalSec : 0;

  const isPro = plan === "pro";
  const urgency = remaining !== null && remaining < 60;
  const imminent = remaining !== null && remaining < 30;

  const min = remaining !== null ? Math.floor(remaining / 60) : 0;
  const sec = remaining !== null ? remaining % 60 : 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border-2 px-4 py-2 transition-all duration-500",
        imminent
          ? "border-[var(--brand-orange)]/60 bg-[var(--brand-orange)]/5 shadow-[0_0_12px_var(--brand-orange)]/20"
          : "border-ink/15 bg-cream/70",
      )}
    >
      {/* Animated ring progress */}
      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 28 28">
          <circle
            cx="14"
            cy="14"
            r="11"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-ink/10"
          />
          <circle
            cx="14"
            cy="14"
            r="11"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${(2 * Math.PI * 11)}`}
            strokeDashoffset={`${(2 * Math.PI * 11) * (1 - progress)}`}
            className={cn(
              "transition-[stroke-dashoffset] duration-1000 ease-linear",
              imminent
                ? "text-[var(--brand-orange)]"
                : isPro
                  ? "text-[var(--brand-blue)]"
                  : "text-ink/30",
            )}
          />
        </svg>
        {imminent ? (
          <Zap className="relative h-3.5 w-3.5 text-[var(--brand-orange)] animate-pulse" />
        ) : (
          <Clock className="relative h-3 w-3 text-ink/50" />
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-[9px] font-medium uppercase tracking-widest text-ink/40">
          {locale === "fr" ? "Prochain check" : "Next check"}
        </span>
        <span
          className={cn(
            "font-mono text-sm font-bold tabular-nums leading-tight",
            imminent && "text-[var(--brand-orange)] animate-pulse",
          )}
        >
          {remaining !== null ? (
            <>
              {String(min).padStart(2, "0")}:{String(sec).padStart(2, "0")}
            </>
          ) : (
            "--:--"
          )}
        </span>
      </div>
    </div>
  );
}
