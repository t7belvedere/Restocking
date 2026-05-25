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
  optimized: {
    badge: "bg-[var(--brand-lime)] text-ink",
    dot: "bg-[oklch(0.55_0.18_142)]",
    ring: "ring-[var(--brand-lime)]",
  },
  beta: {
    badge: "bg-[var(--brand-blue)] text-ink",
    dot: "bg-[oklch(0.55_0.2_240)]",
    ring: "ring-[var(--brand-blue)]",
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
      value: "optimized",
      label: t.retailers.filterLive,
      count: RETAILER_COUNTS.optimized,
    },
    {
      value: "beta",
      label: t.retailers.filterBeta,
      count: RETAILER_COUNTS.beta,
    },
  ];

  return (
    <main data-testid="retailers-page" className="overflow-hidden">
      {/* HERO */}
      <section className="relative border-b-2 border-ink bg-paper">
        <div className="dot-paper absolute inset-0" aria-hidden />
        <div className="container relative mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:px-8 lg:py-32">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-cream px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] shadow-brutal-sm">
              <Sparkles className="h-3.5 w-3.5 text-[var(--brand-orange)]" />
              {t.retailers.eyebrow}
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.9] tracking-tighter md:text-8xl">
              {t.retailers.title}
            </h1>
            <p className="mt-8 max-w-xl text-xl leading-relaxed text-ink/70">
              {t.retailers.sub}
            </p>

            <div className="mt-10 max-w-md">
              <p className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-ink/40">
                {t.retailers.tileCta}
              </p>
              <WaitlistForm testIdPrefix="retailers-hero" />
            </div>
          </div>

          <div className="relative">
            <div className="relative rotate-1 rounded-3xl border-2 border-ink bg-[var(--brand-lime)] p-8 shadow-brutal-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-paper shadow-brutal-sm">
                <CircleDot className="h-7 w-7 animate-pulse text-ink" />
              </div>
              <h3 className="mt-6 font-display text-3xl font-extrabold tracking-tight">
                {t.retailers.universalCardTitle}
              </h3>
              <p className="mt-3 text-lg font-medium leading-snug text-ink/80">
                {t.retailers.universalCardBody}
              </p>
              <div className="mt-6 flex gap-2">
                <span className="rounded-full border-2 border-ink bg-paper px-3 py-1 text-xs font-bold uppercase">
                  Any .com
                </span>
                <span className="rounded-full border-2 border-ink bg-paper px-3 py-1 text-xs font-bold uppercase">
                  Any .fr
                </span>
                <span className="rounded-full border-2 border-ink bg-paper px-3 py-1 text-xs font-bold uppercase">
                  Any .it
                </span>
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -left-4 -top-4 -rotate-6 rounded-lg border-2 border-ink bg-[var(--brand-blue)] px-4 py-2 font-display text-sm font-black shadow-brutal">
              99% COVERAGE
            </div>
          </div>
        </div>
      </section>

      <RestockTicker variant="orange" />

      {/* FILTER */}
      <section className="border-b-2 border-ink bg-cream">
        <div className="container mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
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
                        active ? "bg-cream text-ink" : "bg-ink text-cream",
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-4">
              <LegendItem
                label={t.retailers.legendInStock}
                status="optimized"
                testId="legend-optimized"
              />
              <LegendItem
                label={t.retailers.legendBeta}
                status="beta"
                testId="legend-universal"
              />
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="border-b-2 border-ink bg-paper">
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
                      {r.country} · {r.name}
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
                    <a
                      href={`https://${r.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${r.name} website`}
                    >
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-ink/30 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* FADE HINT — ghost cards extending the grid */}
      <section className="border-b-2 border-ink bg-paper" aria-hidden="true">
        <div className="container mx-auto max-w-7xl px-0">
          <div className="grid grid-cols-2 border-l-2 border-ink sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 blur-[3px] opacity-25 select-none pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex h-[140px] flex-col justify-between border-b-2 border-r-2 border-ink p-5 md:h-[160px]"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
                    EU · Brand
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                    live
                  </span>
                </div>
                <div className="flex flex-1 items-center pt-3">
                  <div className="h-6 w-24 rounded bg-ink/20" />
                </div>
                <div className="flex items-end justify-between gap-2">
                  <p className="max-w-[24ch] text-[11px] leading-snug text-ink">
                    Description placeholder
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REQUEST */}
      <section className="border-b-2 border-ink bg-[var(--brand-blue)]">
        <div className="container mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:px-8">
          <div>
            <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tighter text-ink md:text-5xl">
              {t.retailers.requestTitle}
            </h2>
            <p className="mt-4 max-w-xl text-base text-ink/80">
              {t.retailers.requestBody}
            </p>
            <Link
              href="mailto:hello@restocking.app?subject=Suggest%20a%20site"
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
