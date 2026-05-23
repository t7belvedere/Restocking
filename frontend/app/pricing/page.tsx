"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkles, Zap } from "lucide-react";
import { useLocale } from "@/components/site/locale-provider";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const { t } = useLocale();
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  const free = t.pricing.plans.free;
  const pro = t.pricing.plans.pro;
  const proPrice = billing === "annual" ? pro.priceAnnual : pro.priceMonthly;
  const proUnit = billing === "annual" ? pro.unitAnnual : pro.unitMonthly;

  return (
    <main data-testid="pricing-page" className="overflow-hidden">
      <section className="relative border-b-2 border-ink">
        <div className="dot-paper absolute inset-0" aria-hidden />
        <div className="container relative mx-auto max-w-5xl px-5 py-20 text-center lg:px-8 lg:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] shadow-brutal-sm">
            <Sparkles className="h-3.5 w-3.5 text-[var(--brand-orange)]" />
            {t.pricing.eyebrow}
          </span>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-none tracking-tighter md:text-7xl">
            {t.pricing.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink/70">
            {t.pricing.sub}
          </p>

          <div
            role="group"
            aria-label="Billing"
            data-testid="pricing-toggle"
            className="mx-auto mt-10 inline-flex h-12 items-center rounded-full border-2 border-ink bg-paper p-1 shadow-brutal-sm"
          >
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              data-testid="toggle-monthly"
              aria-pressed={billing === "monthly"}
              className={cn(
                "h-full rounded-full px-5 font-display text-sm font-bold uppercase tracking-widest transition-colors",
                billing === "monthly"
                  ? "bg-ink text-cream"
                  : "text-ink/60 hover:text-ink",
              )}
            >
              {t.pricing.toggleMonthly}
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              data-testid="toggle-annual"
              aria-pressed={billing === "annual"}
              className={cn(
                "h-full rounded-full px-5 font-display text-sm font-bold uppercase tracking-widest transition-colors",
                billing === "annual"
                  ? "bg-ink text-cream"
                  : "text-ink/60 hover:text-ink",
              )}
            >
              {t.pricing.toggleAnnual}
            </button>
          </div>
        </div>
      </section>

      {/* CARDS */}
      <section className="border-b-2 border-ink bg-cream">
        <div className="container mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* FREE */}
            <article
              data-testid="plan-free-card"
              className="flex h-full flex-col rounded-3xl border-2 border-ink bg-paper p-8 shadow-brutal-lg"
            >
              <header>
                <h2 className="font-display text-3xl font-extrabold tracking-tight">
                  {free.name}
                </h2>
                <p className="mt-1 text-sm text-ink/60">{free.tagline}</p>
              </header>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-6xl font-extrabold tracking-tighter">
                  {free.price}
                </span>
                <span className="font-medium text-ink/60">{free.unit}</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3 text-sm">
                {free.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink bg-cream">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-ink/80">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/#waitlist"
                data-testid="plan-free-cta"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full border-2 border-ink bg-paper font-display text-sm font-bold uppercase tracking-widest text-ink shadow-brutal-sm hover-press"
              >
                {free.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </article>

            {/* PRO */}
            <article
              data-testid="plan-pro-card"
              className="relative flex h-full flex-col rounded-3xl border-2 border-ink bg-[var(--brand-orange)] p-8 shadow-brutal-xl"
            >
              <span
                data-testid="plan-pro-badge"
                className="badge-rotate absolute -right-3 -top-4 inline-flex h-9 items-center rounded-full border-2 border-ink bg-[var(--brand-lime)] px-4 font-display text-xs font-bold uppercase tracking-widest text-ink shadow-brutal-sm"
              >
                <Zap className="mr-1 h-3.5 w-3.5" /> {t.common.mostPopular}
              </span>
              <header>
                <h2 className="font-display text-3xl font-extrabold tracking-tight">
                  {pro.name}
                </h2>
                <p className="mt-1 text-sm text-ink/70">{pro.tagline}</p>
              </header>
              <div className="mt-6 flex items-baseline gap-2">
                <span
                  data-testid="plan-pro-price"
                  className="font-display text-6xl font-extrabold tracking-tighter"
                >
                  {proPrice}
                </span>
                <span className="font-medium text-ink/70">{proUnit}</span>
              </div>
              {billing === "annual" ? (
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-ink/80">
                  {t.common.saveBadge}
                </p>
              ) : null}
              <ul className="mt-8 flex-1 space-y-3 text-sm">
                {pro.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink bg-paper">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-ink/90">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/#waitlist"
                data-testid="plan-pro-cta"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full border-2 border-ink bg-ink font-display text-sm font-bold uppercase tracking-widest text-cream shadow-brutal hover-press"
              >
                {pro.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </article>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-3 rounded-3xl border-2 border-ink bg-paper px-6 py-5 shadow-brutal-sm">
            <p className="font-medium text-ink/80">{t.pricing.faqLink}</p>
            <Link
              href="/faq"
              data-testid="pricing-faq-link"
              className="font-display text-sm font-bold uppercase tracking-widest text-ink underline decoration-[var(--brand-orange)] decoration-2 underline-offset-4 hover:decoration-ink"
            >
              {t.pricing.faqLinkCta}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
