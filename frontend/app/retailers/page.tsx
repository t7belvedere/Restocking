"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CircleDot, Sparkles, ArrowUpRight } from "lucide-react";
import { useLocale } from "@/components/site/locale-provider";
import { RestockTicker } from "@/components/site/ticker";
import { WaitlistForm } from "@/components/site/waitlist-form";
import { BrandLogo } from "@/components/site/brand-logo";
import { RETAILERS, RETAILER_COUNTS } from "@/lib/data/retailers";
import type { RetailerStatus } from "@/lib/data/retailers";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  live: {
    badge: "bg-[var(--brand-lime)] text-ink",
    dot: "bg-[oklch(0.55_0.18_142)]",
    ring: "ring-[var(--brand-lime)]",
  },
  beta: {
    badge: "bg-[var(--brand-orange)] text-ink",
    dot: "bg-[oklch(0.55_0.2_30)]",
    ring: "ring-[var(--brand-orange)]",
  },
  soon: {
    badge: "bg-paper text-ink",
    dot: "bg-ink/40",
    ring: "ring-ink/30",
  },
} as const;

type FilterValue = "all" | RetailerStatus;

export default function RetailersPage() {
  const { t, locale } = useLocale();
  const [filter, setFilter] = useState<FilterValue>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return RETAILERS;
    return RETAILERS.filter((r) => r.status === filter);
  }, [filter]);

  const filterTabs: { value: FilterValue; label: string; count: number }[] = [
    {
      value: "all",
      label: t.retailers.filterAll,
      count: RETAILER_COUNTS.total,
    },
    {
      value: "live",
      label: t.retailers.filterLive,
      count: RETAILER_COUNTS.live,
    },
    {
      value: "beta",
      label: t.retailers.filterBeta,
      count: RETAILER_COUNTS.beta,
    },
    {
      value: "soon",
      label: t.retailers.filterSoon,
      count: RETAILER_COUNTS.soon,
    },
  ];

  return (
    <main data-testid="retailers-page" className="overflow-hidden">
      {/* HERO */}
      <section className="relative border-b-2 border-ink">
        <div className="dot-paper absolute inset-0" aria-hidden />
        <div className="container relative mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] shadow-brutal-sm">
              <Sparkles className="h-3.5 w-3.5 text-[var(--brand-orange)]" />
              {t.retailers.eyebrow}
            </span>
            <h1 className="mt-6 max-w-3xl font-display text-5xl font-extrabold leading-none tracking-tighter md:text-7xl">
              {t.retailers.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-ink/70">
              {t.retailers.sub}
            </p>
            <div
              className="mt-8 flex flex-wrap gap-2 font-display text-sm font-bold"
              data-testid="retailers-counter"
            >
              <Counter
                value={RETAILER_COUNTS.total}
                label={locale === "fr" ? "marques" : "stores"}
                accent="ink"
              />
              <Counter
                value={RETAILER_COUNTS.live}
                label="live"
                accent="lime"
              />
              <Counter
                value={RETAILER_COUNTS.beta}
                label="beta"
                accent="orange"
              />
              <Counter
                value={RETAILER_COUNTS.soon}
                label={locale === "fr" ? "bientôt" : "soon"}
                accent="paper"
              />
            </div>
          </div>
          <div
            className="flex flex-wrap items-start gap-3 lg:justify-self-end"
            data-testid="legend"
          >
            <LegendItem
              label={t.retailers.legendInStock}
              status="live"
              testId="legend-live"
            />
            <LegendItem
              label={t.retailers.legendBeta}
              status="beta"
              testId="legend-beta"
            />
            <LegendItem
              label={t.retailers.legendSoon}
              status="soon"
              testId="legend-soon"
            />
          </div>
        </div>
      </section>

      <RestockTicker variant="blue" />

      {/* FILTER */}
      <section className="border-b-2 border-ink bg-cream">
        <div className="container mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <div
            role="tablist"
            aria-label="Filter retailers by status"
            data-testid="retailer-filter"
            className="flex flex-wrap gap-2"
          >
            {filterTabs.map((tab) => {
              const active = filter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-testid={`filter-${tab.value}`}
                  onClick={() => setFilter(tab.value)}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-full border-2 border-ink px-4 font-display text-sm font-bold uppercase tracking-widest transition-all",
                    active
                      ? "bg-ink text-cream shadow-brutal"
                      : "bg-paper text-ink shadow-brutal-sm hover-press",
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 font-mono text-xs",
                      active
                        ? "bg-cream text-ink"
                        : "bg-ink text-cream",
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="border-b-2 border-ink bg-paper">
        {filtered.length === 0 ? (
          <div className="container mx-auto max-w-3xl px-5 py-24 text-center lg:px-8">
            <h3 className="font-display text-3xl font-extrabold tracking-tighter">
              {t.retailers.noResultsTitle}
            </h3>
            <p className="mt-3 text-ink/60">{t.retailers.noResultsBody}</p>
          </div>
        ) : (
          <div
            className="container mx-auto max-w-7xl px-0"
            data-testid="retailer-grid"
          >
            <div className="grid grid-cols-2 border-l-2 border-ink sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((r) => {
                const status = r.status as RetailerStatus;
                const style = STATUS_STYLES[status];
                const slug = r.name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");
                return (
                  <article
                    key={r.name}
                    data-testid={`retailer-card-${slug}`}
                    className="group relative flex h-[180px] flex-col justify-between overflow-hidden border-b-2 border-r-2 border-ink bg-paper p-5 transition-colors duration-200 hover:bg-cream md:h-[200px]"
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                        {r.country}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border-2 border-ink px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
                          style.badge,
                        )}
                      >
                        <CircleDot className={cn("h-2 w-2", style.dot)} />
                        {status}
                      </span>
                    </div>
                    <div className="flex flex-1 items-center pt-3">
                      <BrandLogo
                        retailer={r}
                        wordmarkClassName="block max-w-full text-2xl leading-tight md:text-[1.75rem]"
                      />
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <p className="max-w-[24ch] text-[11px] leading-snug text-ink/55">
                        {locale === "fr" ? r.note_fr : r.note_en}
                      </p>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-ink/30 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* REQUEST */}
      <section className="border-b-2 border-ink bg-[var(--brand-lime)]">
        <div className="container mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:px-8">
          <div>
            <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tighter md:text-5xl">
              {t.retailers.requestTitle}
            </h2>
            <p className="mt-4 max-w-xl text-base text-ink/80">
              {t.retailers.requestBody}
            </p>
            <Link
              href="mailto:hello@restocking.app?subject=Suggest%20a%20store"
              data-testid="suggest-retailer-cta"
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-ink px-5 font-display text-sm font-bold uppercase tracking-wide text-cream shadow-brutal hover-press"
            >
              {t.retailers.requestCta}
            </Link>
          </div>
          <div className="rounded-3xl border-2 border-ink bg-paper p-6 shadow-brutal-lg">
            <h3 className="font-display text-xl font-bold">
              {t.common.joinWaitlist}
            </h3>
            <p className="mt-1 text-sm text-ink/60">{t.common.privacy}</p>
            <div className="mt-4">
              <WaitlistForm testIdPrefix="retailers" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function LegendItem({
  label,
  status,
  testId,
}: {
  label: string;
  status: RetailerStatus;
  testId: string;
}) {
  const style = STATUS_STYLES[status];
  return (
    <div
      data-testid={testId}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 border-ink px-3 py-1.5 text-xs font-bold uppercase tracking-widest shadow-brutal-sm",
        style.badge,
      )}
    >
      <CircleDot className={cn("h-2.5 w-2.5", style.dot)} /> {label}
    </div>
  );
}

function Counter({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent: "ink" | "orange" | "blue" | "lime" | "paper";
}) {
  const bg =
    accent === "lime"
      ? "bg-[var(--brand-lime)]"
      : accent === "orange"
        ? "bg-[var(--brand-orange)]"
        : accent === "blue"
          ? "bg-[var(--brand-blue)]"
          : accent === "ink"
            ? "bg-ink text-cream"
            : "bg-paper";
  return (
    <span
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full border-2 border-ink px-3 shadow-brutal-sm",
        bg,
      )}
    >
      <span className="font-display text-base font-extrabold tracking-tight">
        {value}
      </span>
      <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">
        {label}
      </span>
    </span>
  );
}
