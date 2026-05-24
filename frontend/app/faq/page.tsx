"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import { useLocale } from "@/components/site/locale-provider";
import { FaqJsonLd } from "@/components/site/json-ld";
import { cn } from "@/lib/utils";

export default function FaqPage() {
  const { t } = useLocale();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <main data-testid="faq-page" className="overflow-hidden">
      <FaqJsonLd questions={t.faq.items} />
      <section className="relative border-b-2 border-ink">
        <div className="dot-paper absolute inset-0" aria-hidden />
        <div className="container relative mx-auto max-w-4xl px-5 py-20 lg:px-8 lg:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] shadow-brutal-sm">
            <Sparkles className="h-3.5 w-3.5 text-[var(--brand-orange)]" />
            {t.faq.eyebrow}
          </span>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-none tracking-tighter md:text-7xl">
            {t.faq.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/70">{t.faq.sub}</p>
        </div>
      </section>

      <section className="border-b-2 border-ink bg-paper">
        <div
          className="container mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-20"
          data-testid="faq-accordion"
        >
          <ul className="space-y-3">
            {t.faq.items.map((item, i) => {
              const open = openIdx === i;
              return (
                <li
                  key={i}
                  data-testid={`faq-item-${i}`}
                  className={cn(
                    "rounded-2xl border-2 border-ink bg-cream shadow-brutal-sm transition-all",
                    open && "bg-paper shadow-brutal",
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    data-testid={`faq-trigger-${i}`}
                    onClick={() => setOpenIdx(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                  >
                    <span className="font-display text-lg font-bold leading-snug tracking-tight text-ink md:text-xl">
                      {item.q}
                    </span>
                    <span
                      className={cn(
                        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-[var(--brand-orange)] transition-transform",
                        open && "rotate-45",
                      )}
                    >
                      <Plus className="h-4 w-4 text-ink" />
                    </span>
                  </button>
                  {open ? (
                    <div
                      data-testid={`faq-content-${i}`}
                      className="border-t-2 border-ink/15 px-5 pb-5 pt-4 text-sm leading-relaxed text-ink/80 md:text-base"
                    >
                      {item.a}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="border-b-2 border-ink bg-[var(--brand-blue)]">
        <div className="container mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-6 px-5 py-16 lg:px-8">
          <div>
            <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
              hello@restocking.app
            </h2>
            <p className="mt-2 max-w-xl text-ink/80">
              {t.faq.sub}
            </p>
          </div>
          <Link
            href="/#waitlist"
            data-testid="faq-waitlist-cta"
            className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-ink bg-ink px-5 font-display text-sm font-bold uppercase tracking-wide text-cream shadow-brutal hover-press"
          >
            {t.nav.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
