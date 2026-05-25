"use client";

import { useTranslations, useLocale } from "next-intl";

const FR_ITEMS = [
  { brand: "ZARA", item: "Manteau oversize · Taille S", time: "il y a 2 min" },
  { brand: "COS", item: "Maille mérinos · Taille M", time: "il y a 4 min" },
  { brand: "ARITZIA", item: "Effortless Pant · 8 Long", time: "il y a 7 min" },
  { brand: "SÉZANE", item: "Pull Gaspard · Taille 38", time: "il y a 12 min" },
  { brand: "UNIQLO", item: "U Half Zip · Taille L", time: "il y a 18 min" },
  { brand: "ARKET", item: "Wide Wool Trouser · 36", time: "il y a 23 min" },
  { brand: "MANGO", item: "Trench long · Taille XS", time: "il y a 31 min" },
];

const EN_ITEMS = [
  { brand: "ZARA", item: "Oversize coat · Size S", time: "2 min ago" },
  { brand: "COS", item: "Merino knit · Size M", time: "4 min ago" },
  { brand: "ARITZIA", item: "Effortless Pant · 8 Long", time: "7 min ago" },
  { brand: "SÉZANE", item: "Gaspard sweater · 38", time: "12 min ago" },
  { brand: "UNIQLO", item: "U Half Zip · Size L", time: "18 min ago" },
  { brand: "ARKET", item: "Wide Wool Trouser · 36", time: "23 min ago" },
  { brand: "MANGO", item: "Long trench · Size XS", time: "31 min ago" },
];

export function RestockTicker({
  variant = "lime",
  speed = "default",
}: {
  variant?: "lime" | "blue" | "orange" | "ink";
  speed?: "default" | "fast";
}) {
  const t = useTranslations();
  const locale = useLocale();
  const items = locale === "fr" ? FR_ITEMS : EN_ITEMS;

  const bgClass =
    variant === "lime"
      ? "bg-[var(--brand-lime)] text-ink"
      : variant === "blue"
        ? "bg-[var(--brand-blue)] text-ink"
        : variant === "orange"
          ? "bg-[var(--brand-orange)] text-ink"
          : "bg-ink text-cream";

  return (
    <div
      data-testid="restock-ticker"
      className={`relative overflow-hidden border-y-2 border-ink ${bgClass}`}
    >
      <div className={`ticker ${speed === "fast" ? "ticker-fast" : ""} py-3.5`}>
        {[...items, ...items].map((it, i) => (
          <div
            key={`${it.brand}-${i}`}
            className="flex shrink-0 items-center gap-3 px-6"
          >
            <span className="rounded-full border-2 border-ink bg-paper px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ink">
              {t("common.restocked")}
            </span>
            <span className="font-display text-base font-bold uppercase tracking-tight">
              {it.brand}
            </span>
            <span className="text-sm font-medium opacity-80">
              {it.item}
            </span>
            <span className="font-mono text-xs opacity-70">{it.time}</span>
            <span className="text-ink/30">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
