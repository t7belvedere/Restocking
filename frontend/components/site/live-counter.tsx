"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

const BASE_OFFSET = 137; // small visible base so it never reads "0"

export function LiveCounter({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "lime" | "blue";
}) {
  const t = useTranslations();
  const [count, setCount] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) return;
      try {
        const { count: total, error } = await supabase
          .from("waitlist")
          .select("*", { count: "exact", head: true });

        if (error || total === null) return;
        if (active) setCount(total + BASE_OFFSET);
      } catch {
        // ignore
      }
    }
    load();
    const id = setInterval(load, 20000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [supabase]);

  const dotColor =
    variant === "lime"
      ? "bg-[var(--brand-lime)]"
      : variant === "blue"
        ? "bg-[var(--brand-blue)]"
        : "bg-[oklch(0.65_0.18_142)]";

  return (
    <div
      className={className}
      data-testid="live-counter"
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-3 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-semibold text-ink shadow-brutal-sm">
        <span className="flex items-center justify-center">
          <span className={`pulse-dot inline-block h-2.5 w-2.5 rounded-full ${dotColor}`} />
        </span>
        {count === null ? (
          <span className="animate-pulse font-mono text-ink/70">…</span>
        ) : (
          <span>
            <span className="font-mono font-bold text-ink">
              {count.toLocaleString()}
            </span>{" "}
            <span className="font-medium text-ink/70">
              {t("common.counterPre")} {t("common.counterPost")}
            </span>
          </span>
        )}
      </span>
    </div>
  );
}
