"use client";

import { Bell, Sparkles, Timer } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export function ProductDemoCard({
  status = "in_stock",
}: {
  status?: "in_stock" | "out_of_stock";
}) {
  const t = useTranslations();
  const locale = useLocale();
  const inStock = status === "in_stock";

  return (
    <div
      data-testid="product-demo-card"
      className="relative rounded-3xl border-2 border-ink bg-paper p-5 shadow-brutal-xl"
    >
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-cream px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink">
          <Sparkles className="h-3 w-3" /> Live preview
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest ${
            inStock
              ? "bg-[var(--brand-lime)] text-ink"
              : "bg-[oklch(0.92_0.02_30)] text-ink/60"
          }`}
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              inStock ? "bg-ink pulse-dot" : "bg-ink/40"
            }`}
          />
          {inStock ? t("common.restocked") : t("common.soldOut")}
        </span>
      </div>

      <div className="mt-4 flex gap-4">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-2 border-ink bg-cream">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80"
            alt="Manteau oversize"
            className="h-full w-full object-cover"
          />
          {inStock ? (
            <span className="absolute bottom-1 left-1 inline-flex items-center gap-1 rounded-full border border-ink bg-paper px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest">
              · cos
            </span>
          ) : null}
        </div>
        <div className="flex-1">
          <p className="font-display text-xl font-bold leading-tight text-ink">
            {locale === "fr" ? "Manteau oversize en laine" : "Oversize wool coat"}
          </p>
          <p className="text-sm font-medium text-ink/60">cos.com</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["XS", "S", "M", "L", "XL"].map((s) => (
              <span
                key={s}
                className={`inline-flex h-7 w-9 items-center justify-center rounded-md border-2 text-xs font-bold ${
                  s === "S"
                    ? "border-ink bg-[var(--brand-orange)] text-ink shadow-brutal-sm"
                    : "border-ink/30 bg-paper text-ink/40"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
          <p className="mt-3 font-display text-lg font-bold text-ink">250,00 €</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 text-ink/60">
          <Timer className="h-3.5 w-3.5" />
          {locale === "fr"
            ? "Vérifié il y a 2 min · source dataLayer"
            : "Checked 2 min ago · source dataLayer"}
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-ink/80">
          <Bell className="h-3.5 w-3.5" /> 1 watcher
        </span>
      </div>
    </div>
  );
}

export function NotificationMockup() {
  const locale = useLocale();
  return (
    <div
      data-testid="notification-mockup"
      className="relative w-[260px] rounded-2xl border-2 border-ink bg-paper p-3 shadow-brutal"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-ink bg-[var(--brand-orange)]">
          <Bell className="h-4 w-4 text-ink" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-ink/60">
            <span>restocking.app</span>
            <span>now</span>
          </div>
          <p className="mt-0.5 font-display text-sm font-bold text-ink">
            {locale === "fr"
              ? "Ta taille S est revenue !"
              : "Your size S is back!"}
          </p>
          <p className="text-xs text-ink/60">
            {locale === "fr"
              ? "COS — Manteau oversize en laine, bleu marine."
              : "COS — Oversize wool coat, navy blue."}
          </p>
        </div>
      </div>
    </div>
  );
}
