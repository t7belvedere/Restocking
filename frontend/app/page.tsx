import Link from "next/link";
import { ArrowRight, Quote, Sparkles, CalendarCheck, Rocket, Users } from "lucide-react";
import { getTranslations, getMessages } from "next-intl/server";
import { WaitlistForm } from "@/components/site/waitlist-form";
import { LiveCounter } from "@/components/site/live-counter";
import { RestockTicker } from "@/components/site/ticker";
import {
  ProductDemoCard,
  NotificationMockup,
} from "@/components/site/product-demo";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/scroll-reveal";

export default async function HomePage() {
  const t = await getTranslations();
  const messages = await getMessages();
  const home = (messages as any).home;

  return (
    <main data-testid="home-page" className="overflow-hidden">
      {/* HERO */}
      <section
        id="waitlist"
        className="relative border-b-2 border-ink"
        data-testid="hero"
      >
        <div
          aria-hidden
          className="dot-paper pointer-events-none absolute inset-0"
        />
        <div className="container relative mx-auto grid max-w-7xl gap-14 px-5 py-16 lg:grid-cols-[1.15fr_1fr] lg:items-start lg:gap-10 lg:px-8 lg:py-24">
          {/* LEFT */}
          <div className="relative">
            <ScrollReveal>
              <span
                data-testid="hero-eyebrow"
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] shadow-brutal-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-[var(--brand-orange)]" />
                {t("home.eyebrow")}
              </span>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h1
                data-testid="hero-title"
                className="mt-6 font-display text-[3.25rem] font-extrabold leading-[0.92] tracking-tighter text-ink md:text-[4.5rem] lg:text-[5.5rem]"
              >
                <span className="block">{t("home.h1Top")}</span>
                <span className="relative inline-block">
                  <span className="relative z-10">{t("home.h1Mid")}</span>
                  <span
                    aria-hidden
                    className="absolute inset-x-[-6px] bottom-2 -z-0 block h-[0.38em] -rotate-1 bg-[var(--brand-lime)]"
                  />
                </span>{" "}
                <span className="text-[var(--brand-orange)]">
                  {t("home.h1Bot")}
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p
                data-testid="hero-sub"
                className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75"
              >
                {t("home.sub")}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="mt-8 max-w-xl space-y-4" data-testid="hero-form-wrap">
                <WaitlistForm testIdPrefix="hero" />
                <LiveCounter />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.35}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/how-it-works"
                  data-testid="hero-secondary-cta"
                  className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-ink bg-paper px-5 font-display text-sm font-bold uppercase tracking-wide text-ink shadow-brutal-sm hover-press"
                >
                  {t("home.ctaSecondary")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  data-testid="hero-pricing-cta"
                  className="text-sm font-semibold text-ink/70 underline decoration-ink/30 underline-offset-4 hover:text-ink"
                >
                  {t("nav.pricing")} →
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* RIGHT */}
          <div className="relative mt-2 lg:mt-0">
            <div className="absolute -left-6 -top-6 hidden h-32 w-32 rotate-12 rounded-full border-2 border-ink bg-[var(--brand-blue)] md:block" />
            <div className="absolute -right-10 bottom-10 hidden h-24 w-24 -rotate-6 rounded-2xl border-2 border-ink bg-[var(--brand-lime)] md:block" />
            <div className="relative">
              <ProductDemoCard />
              <div className="absolute -bottom-10 -left-6 hidden md:block">
                <NotificationMockup />
              </div>
              <div className="absolute -right-4 -top-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://static.prod-images.emergentagent.com/jobs/40fdc8e3-cfec-4df7-8e98-e85f89d6fe27/images/335f73b191dda7303f3dcf89714450cbe0ab04c564577914ae2f9965b771d903.png"
                  alt="Restocked stamp"
                  className="stamp-spin h-24 w-24 drop-shadow-[2px_2px_0_var(--ink)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <RestockTicker variant="lime" />

      {/* LAUNCH TIMELINE */}
      <section className="border-b-2 border-ink bg-paper">
        <div className="container mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16">
          <ScrollReveal>
            <div className="mb-10 flex flex-col items-center gap-3 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[var(--brand-lime)] px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] shadow-brutal-sm">
                <Rocket className="h-3.5 w-3.5" />
                {t("home.eyebrow")}
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-tighter text-ink md:text-4xl">
                Lancement le <span className="text-[var(--brand-orange)]">1er juillet 2026</span>
              </h2>
              <p className="max-w-md text-sm text-ink/60">
                Inscris-toi maintenant pour être parmi les premiers à accéder à l'application.
              </p>
            </div>
          </ScrollReveal>

          <div className="relative mx-auto max-w-3xl">
            {/* connector line */}
            <div aria-hidden className="absolute left-[calc(50%-1px)] top-6 hidden h-[calc(100%-3rem)] w-0.5 border-l-2 border-dashed border-ink/20 md:block" />

            <StaggerContainer className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: <Users className="h-5 w-5" />,
                  color: "bg-[var(--brand-blue)]",
                  label: "Maintenant",
                  title: "Liste d'attente",
                  desc: "Inscris ton email pour réserver ta place en priorité.",
                  done: true,
                },
                {
                  icon: <Sparkles className="h-5 w-5" />,
                  color: "bg-[var(--brand-lime)]",
                  label: "Juin 2026",
                  title: "Bêta fermée",
                  desc: "Les premiers inscrits testent l'appli en avant-première.",
                  done: false,
                },
                {
                  icon: <Rocket className="h-5 w-5" />,
                  color: "bg-[var(--brand-orange)]",
                  label: "1er juillet 2026",
                  title: "Lancement",
                  desc: "Ouverture au public. Alertes en temps réel, taille par taille.",
                  done: false,
                },
              ].map((step, i) => (
                <StaggerItem key={i}>
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`relative inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink ${step.color} shadow-brutal-sm`}
                    >
                      {step.icon}
                      {step.done && (
                        <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full border-2 border-ink bg-paper text-[9px] font-black text-ink">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="mt-3 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-ink/50">
                      {step.label}
                    </span>
                    <h3 className="mt-1 font-display text-lg font-extrabold tracking-tight text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-ink/60">{step.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section
        data-testid="stats-section"
        className="border-b-2 border-ink bg-paper"
      >
        <StaggerContainer className="container mx-auto grid max-w-7xl grid-cols-2 gap-0 px-0 lg:grid-cols-4">
          {home.stats.map((s: any, i: number) => (
            <StaggerItem
              key={s.label}
              className={`flex flex-col gap-2 border-ink px-6 py-10 ${
                i < home.stats.length - 1 ? "lg:border-r-2" : ""
              } ${i < 2 ? "border-b-2 lg:border-b-0" : ""} ${
                i % 2 === 1 ? "" : "border-r-2 lg:border-r-2"
              }`}
              data-testid={`stat-${i}`}
            >
              <p className="font-display text-4xl font-extrabold leading-none tracking-tighter text-ink lg:text-5xl">
                {s.value}
              </p>
              <p className="text-sm font-medium text-ink/70">{s.label}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* SOCIAL PROOF */}
      <section
        data-testid="social-proof"
        className="border-b-2 border-ink bg-cream"
      >
        <div className="container mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <ScrollReveal>
            <div className="grid gap-4 lg:grid-cols-[1fr_2fr] lg:items-end">
              <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tighter text-ink md:text-5xl">
                {t("home.proofTitle")}
              </h2>
              <p className="max-w-xl text-base text-ink/70">
                {t("home.bigCtaSub")}
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="mt-12 grid gap-5 md:grid-cols-2">
            {home.proofItems.map((q: any, i: number) => {
              const palette = [
                "bg-[var(--brand-lime)]",
                "bg-[var(--brand-blue)] text-ink",
                "bg-[var(--brand-orange)]",
                "bg-paper",
              ];
              return (
                <StaggerItem
                  key={i}
                  data-testid={`testimonial-${i}`}
                >
                  <figure
                    className={`group relative rounded-3xl border-2 border-ink p-6 shadow-brutal hover-lift ${
                      palette[i % palette.length]
                    }`}
                  >
                    <Quote className="absolute right-5 top-5 h-6 w-6 text-ink/40" />
                    <blockquote className="font-display text-xl font-semibold leading-snug text-ink">
                      "{q.quote}"
                    </blockquote>
                    <figcaption className="mt-5 flex items-center gap-3 text-sm">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-paper font-display font-bold text-ink">
                        {q.author.slice(0, 1).toUpperCase()}
                      </span>
                      <span>
                        <span className="block font-semibold text-ink">
                          {q.author}
                        </span>
                        <span className="block text-xs uppercase tracking-widest text-ink/60">
                          {q.source}
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* BIG CTA */}
      <section data-testid="big-cta" className="relative bg-ink text-cream">
        <div className="dot-paper absolute inset-0" aria-hidden />
        <div className="container relative mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:px-8 lg:py-28">
          <ScrollReveal>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-cream/40 px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.2em] text-cream/80">
                <Sparkles className="h-3.5 w-3.5 text-[var(--brand-lime)]" />
                {t("common.waitlist")}
              </span>
              <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight tracking-tighter text-cream md:text-6xl">
                {t("home.bigCtaTitle")}
              </h2>
              <p className="mt-5 max-w-xl text-base text-cream/70">
                {t("home.bigCtaSub")}
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <div className="relative">
              <div className="rounded-3xl border-2 border-cream/30 bg-cream p-6 text-ink shadow-brutal-xl">
                <h3 className="font-display text-xl font-bold text-ink">
                  {t("common.joinWaitlist")}
                </h3>
                <p className="mt-1 text-sm text-ink/60">{t("common.privacy")}</p>
                <div className="mt-5">
                  <WaitlistForm testIdPrefix="big-cta" />
                </div>
                <div className="mt-4">
                  <LiveCounter variant="blue" />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
