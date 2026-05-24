"use client";

import Link from "next/link";
import { ArrowRight, BellOff, Clipboard, Bell, Sparkles, ShieldCheck, MapPin, RefreshCcw, Zap, Sliders } from "lucide-react";
import { useLocale } from "@/components/site/locale-provider";
import { WaitlistForm } from "@/components/site/waitlist-form";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/scroll-reveal";

const STEP_ASSETS = [
  "https://static.prod-images.emergentagent.com/jobs/40fdc8e3-cfec-4df7-8e98-e85f89d6fe27/images/900cf514768684e136ea91a398eefac18ad6e9aa5d094d05f3780a8e1cb11a73.png",
  "https://static.prod-images.emergentagent.com/jobs/40fdc8e3-cfec-4df7-8e98-e85f89d6fe27/images/335f73b191dda7303f3dcf89714450cbe0ab04c564577914ae2f9965b771d903.png",
  "https://static.prod-images.emergentagent.com/jobs/40fdc8e3-cfec-4df7-8e98-e85f89d6fe27/images/e5fed67e911c64818c19506a9c176e1055562df01e708e1bef140da8ad9eb313.png",
];

const STEP_BGS = [
  "bg-[var(--brand-orange)]",
  "bg-[var(--brand-blue)]",
  "bg-[var(--brand-lime)]",
];

const STEP_ICONS = [Clipboard, Sparkles, Bell];

const DETAIL_ICONS = [RefreshCcw, ShieldCheck, MapPin, ShieldCheck, Bell];
const WHY_ICONS = [Zap, Sliders, BellOff];

export default function HowItWorksPage() {
  const { t } = useLocale();
  return (
    <main data-testid="how-it-works-page" className="overflow-hidden">
      <section className="relative border-b-2 border-ink">
        <div className="dot-paper absolute inset-0" aria-hidden />
        <div className="container relative mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
          <ScrollReveal>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] shadow-brutal-sm">
              <Sparkles className="h-3.5 w-3.5 text-[var(--brand-orange)]" />
              {t.how.eyebrow}
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-extrabold leading-none tracking-tighter md:text-7xl">
              {t.how.title}
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg text-ink/70">{t.how.sub}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* BENTO STEPS */}
      <section className="border-b-2 border-ink bg-cream">
        <div className="container mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <StaggerContainer className="grid gap-6 lg:grid-cols-3">
            {t.how.steps.map((step, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <StaggerItem
                  key={step.n}
                  data-testid={`step-${i + 1}-card`}
                  className={`relative flex flex-col rounded-3xl border-2 border-ink p-7 shadow-brutal-lg ${STEP_BGS[i]}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-display text-5xl font-extrabold leading-none tracking-tighter text-ink">
                      {step.n}
                    </span>
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ink bg-paper">
                      <Icon className="h-5 w-5 text-ink" />
                    </span>
                  </div>
                  <h3 className="mt-8 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/80">
                    {step.body}
                  </p>
                  <div className="mt-6">
                    <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-ink shadow-brutal-sm">
                      {step.pill}
                    </span>
                  </div>
                  <div className="pointer-events-none absolute -bottom-3 -right-3 hidden h-24 w-24 -rotate-6 md:block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={STEP_ASSETS[i]}
                      alt=""
                      className="h-full w-full object-contain drop-shadow-[2px_2px_0_var(--ink)]"
                    />
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* DETAILS */}
      <section className="border-b-2 border-ink bg-paper" data-testid="under-the-hood">
        <div className="container mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
          <ScrollReveal>
            <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tighter md:text-5xl">
              {t.how.detailsTitle}
            </h2>
          </ScrollReveal>
          <StaggerContainer className="mt-12 grid gap-5 md:grid-cols-2">
            {t.how.details.map((d, i) => {
              const Icon = DETAIL_ICONS[i % DETAIL_ICONS.length];
              return (
                <StaggerItem
                  key={d.title}
                  data-testid={`detail-${i}`}
                >
                  <div className="group flex gap-4 rounded-3xl border-2 border-ink bg-cream p-6 transition-transform hover-lift">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-[var(--brand-lime)]">
                      <Icon className="h-5 w-5 text-ink" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold tracking-tight text-ink">
                        {d.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink/70">
                        {d.body}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* WHY RESTOCKING */}
      <section className="border-b-2 border-ink bg-cream" data-testid="why-restocking">
        <div className="container mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
          <ScrollReveal>
            <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tighter md:text-5xl">
              {t.how.whyTitle}
            </h2>
          </ScrollReveal>
          <StaggerContainer className="mt-12 grid gap-6 md:grid-cols-3">
            {t.how.whyItems.map((item, i) => {
              const Icon = WHY_ICONS[i];
              return (
                <StaggerItem key={item.title} data-testid={`why-${i}`}>
                  <div className="group rounded-3xl border-2 border-ink bg-paper p-6 shadow-brutal hover-lift">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ink bg-[var(--brand-orange)]">
                      <Icon className="h-5 w-5 text-ink" />
                    </span>
                    <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/70">
                      {item.body}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b-2 border-ink bg-[var(--brand-orange)]">
        <div className="container mx-auto max-w-5xl px-5 py-16 lg:px-8 lg:py-20">
          <ScrollReveal>
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tighter text-ink md:text-5xl">
                {t.home.bigCtaTitle}
              </h2>
              <Link
                href="/#waitlist"
                data-testid="how-to-waitlist-cta"
                className="inline-flex h-14 items-center gap-2 rounded-full border-2 border-ink bg-ink px-6 font-display text-base font-bold uppercase tracking-wide text-cream shadow-brutal hover-press"
              >
                {t.nav.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="mt-8 max-w-xl">
              <WaitlistForm testIdPrefix="how" />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
