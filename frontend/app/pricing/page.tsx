"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Check, Minus, Sparkles, Zap } from "lucide-react";
import { useLocale } from "@/components/site/locale-provider";
import { createCheckoutSession } from "@/app/actions/stripe";
import { cn } from "@/lib/utils";

const FEATURES = [
  { feature: "Produits surveillés", free: "3 max", pro: "20 max", proHighlight: true },
  { feature: "Fréquence de check", free: "Toutes les 30 min", pro: "Toutes les 5 min", proHighlight: true },
  { feature: "Notifications email", free: true, pro: true },
  { feature: "Notifications SMS", free: false, pro: true, proHighlight: true },
  { feature: "Marques optimisées", free: true, pro: true },
  { feature: "Fallback Playwright", free: false, pro: true },
  { feature: "Dashboard temps réel", free: true, pro: true },
  { feature: "Historique des checks", free: "7 jours", pro: "Illimité", proHighlight: true },
  { feature: "Support prioritaire", free: false, pro: true },
];

const FAQ_ITEMS = [
  {
    q: "Je peux changer de plan quand je veux ?",
    a: "Oui, sans engagement. Passe en Pro quand tu veux, rétrograde en Free tout aussi facilement depuis ton dashboard.",
  },
  {
    q: "Comment annuler le Pro ?",
    a: "En deux clics depuis ton compte (portail Stripe). Pas d'engagement, pas de mail à envoyer, pas de bouton caché.",
  },
  {
    q: "Vous faites une offre annuelle ?",
    a: "Oui ! Le plan Pro annuel est à 59€/an, soit 4,90€/mois. C'est deux mois offerts par rapport au mensuel.",
  },
  {
    q: "Je peux tester avant de payer ?",
    a: "Bien sûr. Le plan Free te donne 3 produits surveillés avec checks toutes les 30 minutes. De quoi voir si le service te plaît.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Je suis passée en Pro le jour où j'ai raté un restock COS. Depuis, j'ai chopé 4 pièces que je pensais perdues.",
    author: "Léa, 29 ans",
    source: "Paris",
  },
  {
    quote: "Le plan Free m'a sauvé sur Sézane. Je suis passée en Pro direct après. Les 5 minutes de check, ça change tout.",
    author: "Marine, 32 ans",
    source: "Lyon",
  },
  {
    quote: "Franchement 7,99€ pour ne plus avoir à checker 20 fois par jour, c'est cadeau. J'ai lâché Distill.",
    author: "Thomas, 26 ans",
    source: "Berlin",
  },
];

export default function PricingPage() {
  const { t } = useLocale();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [pending, startTransition] = useTransition();

  const proPrice = billing === "annual" ? "59€" : "7,99€";
  const proUnit = billing === "annual" ? "/ an" : "/ mois";
  const proSub = billing === "annual" ? "soit 4,90€/mois" : "ou 59€/an (deux mois offerts)";

  function handleProCheckout() {
    startTransition(() => createCheckoutSession(billing === "annual" ? "annual" : "monthly"));
  }

  return (
    <main data-testid="pricing-page" className="overflow-hidden">
      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative border-b-2 border-ink bg-cream">
        <div className="dot-paper pointer-events-none absolute inset-0" aria-hidden />
        {/* Decorative shapes */}
        <div aria-hidden className="absolute left-10 top-12 hidden h-20 w-20 rotate-12 rounded-2xl border-2 border-ink bg-[var(--brand-lime)] lg:block" />
        <div aria-hidden className="absolute right-16 top-20 hidden h-16 w-16 -rotate-6 rounded-full border-2 border-ink bg-[var(--brand-blue)] lg:block" />
        <div aria-hidden className="absolute bottom-12 left-1/3 hidden h-12 w-12 rotate-45 rounded-lg border-2 border-ink bg-[var(--brand-pink)] lg:block" />

        <div className="container relative mx-auto max-w-4xl px-5 py-20 text-center lg:px-8 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] shadow-brutal-sm">
            <Sparkles className="h-3.5 w-3.5 text-[var(--brand-orange)]" />
            Tarifs
          </span>

          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.95] tracking-tighter md:text-7xl lg:text-8xl">
            Choisis
            <span className="relative ml-3 inline-block">
              <span className="relative z-10">ton plan</span>
              <span aria-hidden className="absolute inset-x-[-4px] bottom-2 -z-0 block h-[0.3em] -rotate-1 bg-[var(--brand-lime)]" />
            </span>
            .
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-ink/70">
            Commence gratuitement avec 3 produits. Passe en Pro le jour où tu rates un drop qui compte.
          </p>

          {/* Toggle */}
          <div className="mx-auto mt-10 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              data-testid="toggle-monthly"
              className={cn(
                "text-sm font-bold uppercase tracking-widest transition-colors",
                billing === "monthly" ? "text-ink" : "text-ink/40 hover:text-ink/60",
              )}
            >
              Mensuel
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={billing === "annual"}
              data-testid="pricing-toggle"
              onClick={() => setBilling((b) => (b === "monthly" ? "annual" : "monthly"))}
              className={cn(
                "relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border-2 border-ink transition-colors",
                billing === "annual" ? "bg-[var(--brand-lime)]" : "bg-paper",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-paper shadow-brutal-sm transition-transform",
                  billing === "annual" ? "translate-x-8" : "translate-x-1",
                )}
              />
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBilling("annual")}
                data-testid="toggle-annual"
                className={cn(
                  "text-sm font-bold uppercase tracking-widest transition-colors",
                  billing === "annual" ? "text-ink" : "text-ink/40 hover:text-ink/60",
                )}
              >
                Annuel
              </button>
              <span className="badge-rotate inline-flex items-center rounded-full border-2 border-ink bg-[var(--brand-orange)] px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-widest text-ink">
                -30%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CARDS ───────────────────────────────────────────────── */}
      <section className="border-b-2 border-ink bg-paper">
        <div className="container mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            {/* FREE */}
            <article
              data-testid="plan-free-card"
              className="group relative flex flex-col rounded-3xl border-2 border-ink bg-cream p-8 shadow-brutal transition-shadow hover:shadow-brutal-lg md:p-10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">Plan</p>
                  <h2 className="mt-1 font-display text-4xl font-extrabold tracking-tight">Free</h2>
                  <p className="mt-1 text-sm text-ink/60">Pour t&apos;essayer sans risque.</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/40 px-3 py-1 text-xs font-medium text-ink/50">
                  Gratuit
                </span>
              </div>

              <div className="mt-8 flex items-baseline gap-1">
                <span className="font-display text-7xl font-extrabold tracking-tighter">0€</span>
                <span className="text-sm font-medium text-ink/50">/ pour toujours</span>
              </div>

              <ul className="mt-8 flex-1 space-y-3.5">
                {FEATURES.map((f) => (
                  <li key={f.feature} className="flex items-center gap-3 text-sm">
                    {f.free === true ? (
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : f.free === false ? (
                      <Minus className="h-4 w-4 shrink-0 text-ink/25" />
                    ) : (
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    )}
                    <span className="text-ink/80">
                      {f.feature}
                      {typeof f.free === "string" && (
                        <span className="ml-1.5 font-semibold text-ink">{f.free}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                data-testid="plan-free-cta"
                className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-paper font-display text-sm font-bold uppercase tracking-widest text-ink shadow-brutal-sm transition-all hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                Commencer gratuitement
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>

            {/* PRO */}
            <article
              data-testid="plan-pro-card"
              className="group relative flex flex-col rounded-3xl border-2 border-ink bg-[var(--brand-orange)] p-8 shadow-brutal-lg transition-shadow hover:shadow-brutal-xl md:p-10"
            >
              {/* Floating badge */}
              <span className="absolute -right-3 -top-4 z-10 inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-[var(--brand-lime)] px-4 py-1.5 font-display text-xs font-bold uppercase tracking-widest text-ink shadow-brutal-sm">
                <Zap className="h-3 w-3 fill-ink" />
                Le plus populaire
              </span>

              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/60">Plan</p>
                  <h2 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-ink">Pro</h2>
                  <p className="mt-1 text-sm text-ink/70">Pour ne rien rater, jamais.</p>
                </div>
              </div>

              <div className="mt-8 flex items-baseline gap-2">
                <span data-testid="plan-pro-price" className="font-display text-7xl font-extrabold tracking-tighter text-ink">
                  {proPrice}
                </span>
                <span className="text-sm font-medium text-ink/60">{proUnit}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-ink/60">{proSub}</p>

              <ul className="mt-8 flex-1 space-y-3.5">
                {FEATURES.map((f) => (
                  <li key={f.feature} className="flex items-center gap-3 text-sm">
                    <Check className={cn("h-4 w-4 shrink-0", f.proHighlight ? "text-emerald-700" : "text-emerald-600")} />
                    <span className={cn(f.proHighlight ? "font-semibold text-ink" : "text-ink/80")}>
                      {f.feature}
                      {typeof f.pro === "string" && (
                        <span className={cn("ml-1.5", f.proHighlight ? "font-bold text-ink" : "font-semibold text-ink")}>
                          {f.pro}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={handleProCheckout}
                disabled={pending}
                data-testid="plan-pro-cta"
                className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-ink font-display text-sm font-bold uppercase tracking-widest text-cream shadow-brutal transition-all hover:shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60"
              >
                {pending ? (
                  "Redirection vers Stripe…"
                ) : (
                  <>
                    Passer Pro
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* ── FEATURE COMPARISON TABLE ─────────────────────────────── */}
      <section className="border-b-2 border-ink bg-cream">
        <div className="container mx-auto max-w-4xl px-5 py-20 lg:px-8 lg:py-24">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Compare les plans
          </h2>
          <p className="mt-3 text-center text-sm text-ink/60">
            Tout ce qu&apos;il te faut pour décider en 30 secondes.
          </p>

          <div className="mt-12 overflow-hidden rounded-3xl border-2 border-ink bg-paper shadow-brutal">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-ink bg-cream">
                  <th className="px-6 py-4 font-display text-sm font-bold uppercase tracking-widest text-ink/70">
                    Fonctionnalité
                  </th>
                  <th className="px-6 py-4 text-center font-display text-sm font-bold uppercase tracking-widest text-ink/50">
                    Free
                  </th>
                  <th className="px-6 py-4 text-center font-display text-sm font-bold uppercase tracking-widest text-ink">
                    <span className="inline-flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[var(--brand-orange)]" />
                      Pro
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f, i) => (
                  <tr
                    key={f.feature}
                    className={cn(
                      "border-ink/15 transition-colors hover:bg-cream/50",
                      i < FEATURES.length - 1 && "border-b",
                    )}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-ink/80">{f.feature}</td>
                    <td className="px-6 py-4 text-center text-sm">
                      {f.free === true ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-600" />
                      ) : f.free === false ? (
                        <Minus className="mx-auto h-4 w-4 text-ink/20" />
                      ) : (
                        <span className="font-medium text-ink/70">{f.free}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      {f.pro === true ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-600" />
                      ) : f.pro === false ? (
                        <Minus className="mx-auto h-4 w-4 text-ink/20" />
                      ) : (
                        <span className={cn("font-bold", f.proHighlight ? "text-ink" : "text-ink/70")}>
                          {f.pro}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ─────────────────────────────────────────── */}
      <section className="border-b-2 border-ink bg-paper">
        <div className="container mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Ceux qui sont passés en Pro
          </h2>
          <p className="mt-3 text-center text-sm text-ink/60">
            Ils ne reviendraient pas en arrière.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((item, i) => {
              const palettes = [
                "bg-[var(--brand-lime)]",
                "bg-[var(--brand-blue)] text-ink",
                "bg-[var(--brand-orange)]",
              ];
              return (
                <figure
                  key={i}
                  data-testid={`testimonial-${i}`}
                  className={cn(
                    "flex flex-col justify-between rounded-3xl border-2 border-ink p-6 shadow-brutal transition-shadow hover:shadow-brutal-lg",
                    palettes[i],
                  )}
                >
                  <blockquote className="font-display text-lg font-semibold leading-snug text-ink">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-paper font-display text-sm font-bold">
                      {item.author.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink">{item.author}</p>
                      <p className="text-xs uppercase tracking-widest text-ink/50">{item.source}</p>
                    </div>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="border-b-2 border-ink bg-cream">
        <div className="container mx-auto max-w-4xl px-5 py-20 lg:px-8 lg:py-24">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Questions fréquentes
          </h2>
          <p className="mt-3 text-center text-sm text-ink/60">
            Tout ce que tu veux savoir avant de passer Pro.
          </p>

          <dl className="mt-12 space-y-4">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border-2 border-ink bg-paper shadow-brutal-sm transition-shadow hover:shadow-brutal"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 font-display text-lg font-bold tracking-tight">
                  {item.q}
                  <span className="ml-4 shrink-0 text-ink/40 transition-transform group-open:rotate-180">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-5 text-sm leading-relaxed text-ink/70">{item.a}</div>
              </details>
            ))}
          </dl>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────── */}
      <section className="relative border-b-2 border-ink bg-ink text-cream">
        <div className="dot-paper pointer-events-none absolute inset-0" aria-hidden />
        <div className="container relative mx-auto max-w-4xl px-5 py-20 text-center lg:px-8 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-cream/30 bg-ink px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] text-cream/70">
            <Zap className="h-3.5 w-3.5 text-[var(--brand-lime)]" />
            Prêt à ne plus rien rater ?
          </span>
          <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tighter md:text-6xl">
            Passe en Pro.
            <br />
            <span className="text-[var(--brand-lime)]">Ta taille n&apos;attendra pas.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base text-cream/60">
            7,99€/mois, sans engagement. Annulable en deux clics. Et si tu fais partie des 100 premiers, 3 mois offerts.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={handleProCheckout}
              disabled={pending}
              data-testid="bottom-cta-pro"
              className="inline-flex h-14 items-center gap-2 rounded-2xl border-2 border-[var(--brand-lime)] bg-[var(--brand-lime)] px-8 font-display text-sm font-bold uppercase tracking-widest text-ink shadow-brutal-color transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--brand-orange)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60"
            >
              {pending ? "Redirection…" : "Passer Pro"}
              <Sparkles className="h-4 w-4" />
            </button>
            <Link
              href="/signup"
              data-testid="bottom-cta-free"
              className="inline-flex h-14 items-center gap-2 rounded-2xl border-2 border-cream/30 px-8 font-display text-sm font-bold uppercase tracking-widest text-cream transition-all hover:border-cream/60 hover:bg-cream/5"
            >
              Essayer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
