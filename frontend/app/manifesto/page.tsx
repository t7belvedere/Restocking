"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLocale } from "@/components/site/locale-provider";

export default function ManifestoPage() {
  const { t } = useLocale();

  return (
    <main data-testid="manifesto-page" className="overflow-hidden">
      <section className="relative border-b-2 border-ink">
        <div className="dot-paper absolute inset-0" aria-hidden />
        <div className="container relative mx-auto max-w-5xl px-5 py-24 lg:px-8 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] shadow-brutal-sm">
            <Sparkles className="h-3.5 w-3.5 text-[var(--brand-orange)]" />
            {t.manifesto.eyebrow}
          </span>

          <h1
            data-testid="manifesto-title"
            className="mt-10 max-w-5xl font-display text-[2.75rem] font-extrabold leading-[0.95] tracking-tighter text-ink md:text-7xl lg:text-[5.5rem]"
          >
            {t.manifesto.title}
          </h1>

          <div className="pointer-events-none absolute right-6 top-20 hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://static.prod-images.emergentagent.com/jobs/40fdc8e3-cfec-4df7-8e98-e85f89d6fe27/images/335f73b191dda7303f3dcf89714450cbe0ab04c564577914ae2f9965b771d903.png"
              alt="Restocked stamp"
              className="stamp-spin h-40 w-40 drop-shadow-[3px_3px_0_var(--ink)]"
            />
          </div>
        </div>
      </section>

      <section className="border-b-2 border-ink bg-paper">
        <div
          className="container mx-auto grid max-w-5xl gap-12 px-5 py-20 lg:grid-cols-[2fr_1fr] lg:px-8 lg:py-24"
          data-testid="manifesto-content"
        >
          <div className="space-y-7 text-lg leading-relaxed text-ink/85 md:text-xl">
            {t.manifesto.paragraphs.map((p, i) => (
              <p
                key={i}
                data-testid={`manifesto-paragraph-${i}`}
                className={i === 0 ? "first-letter:font-display first-letter:text-7xl first-letter:font-extrabold first-letter:leading-none first-letter:tracking-tighter first-letter:text-[var(--brand-orange)] first-letter:float-left first-letter:mr-3 first-letter:mt-1" : ""}
              >
                {p}
              </p>
            ))}
            <p className="font-display text-2xl font-bold text-ink">
              {t.manifesto.signature}
            </p>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border-2 border-ink bg-[var(--brand-lime)] p-6 shadow-brutal">
              <h3 className="font-display text-2xl font-extrabold tracking-tight">
                Paris · Lyon · Berlin
              </h3>
              <p className="mt-2 text-sm text-ink/80">
                {t.footer.madeIn}
              </p>
            </div>
            <Link
              href="/#waitlist"
              data-testid="manifesto-waitlist-cta"
              className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-ink bg-ink px-5 font-display text-sm font-bold uppercase tracking-wide text-cream shadow-brutal hover-press"
            >
              {t.nav.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
