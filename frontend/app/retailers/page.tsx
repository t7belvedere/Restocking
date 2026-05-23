"use client";

import Link from "next/link";
import { CircleDot, Sparkles } from "lucide-react";
import { useLocale } from "@/components/site/locale-provider";
import { RestockTicker } from "@/components/site/ticker";
import { WaitlistForm } from "@/components/site/waitlist-form";

const STATUS_STYLES = {
  live: {
    badge: "bg-[var(--brand-lime)] text-ink",
    dot: "bg-[oklch(0.65_0.18_142)]",
  },
  beta: {
    badge: "bg-[var(--brand-orange)] text-ink",
    dot: "bg-[var(--brand-orange)]",
  },
  soon: {
    badge: "bg-paper text-ink",
    dot: "bg-ink/40",
  },
} as const;

type Status = keyof typeof STATUS_STYLES;

export default function RetailersPage() {
  const { t } = useLocale();
  const list = t.retailers.list;

  return (
    <main data-testid="retailers-page" className="overflow-hidden">
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

      {/* GRID */}
      <section className="border-b-2 border-ink bg-paper">
        <div
          className="container mx-auto max-w-7xl px-0"
          data-testid="retailer-grid"
        >
          <div className="grid grid-cols-2 border-l-2 border-ink md:grid-cols-3 lg:grid-cols-4">
            {list.map((r) => {
              const status = r.status as Status;
              const style = STATUS_STYLES[status];
              return (
                <article
                  key={r.name}
                  data-testid={`retailer-card-${r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="group relative flex aspect-square flex-col justify-between border-b-2 border-r-2 border-ink bg-paper p-6 transition-colors duration-200 hover:bg-ink hover:text-cream"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono uppercase tracking-widest text-ink/50 group-hover:text-cream/50">
                      {r.country}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${style.badge} group-hover:border-cream group-hover:bg-cream group-hover:text-ink`}
                    >
                      <CircleDot className={`h-2 w-2 ${style.dot}`} />
                      {status}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-3xl font-extrabold leading-none tracking-tighter md:text-4xl">
                      {r.name}
                    </h3>
                    <p className="mt-2 max-w-[18ch] text-xs leading-relaxed text-ink/60 group-hover:text-cream/70">
                      {r.note}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
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
  status: Status;
  testId: string;
}) {
  const style = STATUS_STYLES[status];
  return (
    <div
      data-testid={testId}
      className={`inline-flex items-center gap-2 rounded-full border-2 border-ink px-3 py-1.5 text-xs font-bold uppercase tracking-widest shadow-brutal-sm ${style.badge}`}
    >
      <CircleDot className={`h-2.5 w-2.5 ${style.dot}`} /> {label}
    </div>
  );
}
