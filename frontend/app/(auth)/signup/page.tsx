"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { OnboardingFlow } from "@/components/auth/onboarding-flow";
import { useTranslations } from "next-intl";

export default function SignupPage() {
  const t = useTranslations();
  // The not-configured state is unlikely but we keep the fallback
  const isConfigured = true;

  if (!isConfigured) {
    return (
      <main data-testid="signup-page" className="relative min-h-[80dvh] overflow-hidden">
        <div className="dot-paper pointer-events-none absolute inset-0" aria-hidden />
        <div className="container relative mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
          <section className="relative mx-auto max-w-lg">
            <div className="relative rounded-3xl border-2 border-ink bg-paper p-7 shadow-brutal-xl md:p-9">
              <div className="mb-7">
                <Logo size="md" />
              </div>
              <div className="rounded-2xl border-2 border-ink bg-[var(--brand-orange)] p-6 shadow-brutal">
                <h3 className="font-display text-2xl font-extrabold tracking-tight text-ink">
                  {t("auth.notConfiguredTitle")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">
                  {t("auth.notConfiguredBody")}
                </p>
                <Link
                  href="/#waitlist"
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border-2 border-ink bg-ink px-4 font-display text-xs font-bold uppercase tracking-widest text-cream shadow-brutal-sm hover-press"
                >
                  {t("auth.notConfiguredCta")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main data-testid="signup-page" className="relative min-h-[80dvh] overflow-hidden">
      <div className="dot-paper pointer-events-none absolute inset-0" aria-hidden />
      <div className="container relative mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:py-20">
        {/* LEFT — visual */}
        <aside className="relative hidden lg:block">
          <div className="absolute -right-6 top-10 hidden h-28 w-28 -rotate-6 rounded-2xl border-2 border-ink bg-[var(--brand-lime)] lg:block" />
          <div className="absolute -left-4 bottom-20 hidden h-20 w-20 rotate-12 rounded-full border-2 border-ink bg-[var(--brand-blue)] lg:block" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://static.prod-images.emergentagent.com/jobs/40fdc8e3-cfec-4df7-8e98-e85f89d6fe27/images/900cf514768684e136ea91a398eefac18ad6e9aa5d094d05f3780a8e1cb11a73.png"
            alt=""
            className="stamp-spin h-28 w-28 drop-shadow-[2px_2px_0_var(--ink)]"
          />
          <h2 className="mt-10 font-display text-5xl font-extrabold leading-[0.95] tracking-tighter text-ink">
            {t("auth.signUpTitle")}
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/70">
            {t("auth.signUpSub")}
          </p>
        </aside>

        {/* RIGHT — form card */}
        <section className="relative">
          <div className="absolute -right-4 -top-6 hidden h-20 w-20 -rotate-6 rounded-2xl border-2 border-ink bg-[var(--brand-lime)] md:block" />
          <div className="relative rounded-3xl border-2 border-ink bg-paper p-7 shadow-brutal-xl md:p-9">
            <div className="mb-7">
              <Logo size="md" />
            </div>
            <OnboardingFlow />
          </div>
        </section>
      </div>
    </main>
  );
}
