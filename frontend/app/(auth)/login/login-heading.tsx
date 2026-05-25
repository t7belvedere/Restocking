"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export function LoginHeading() {
  const t = useTranslations();
  return (
    <div>
      <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] shadow-brutal-sm">
        <Sparkles className="h-3.5 w-3.5 text-[var(--brand-orange)]" />
        {t("auth.signIn")}
      </span>
      <h1
        data-testid="login-title"
        className="mt-6 font-display text-5xl font-extrabold leading-[0.95] tracking-tighter text-ink md:text-6xl lg:text-7xl"
      >
        {t("auth.signInTitle")}
      </h1>
      <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/70">
        {t("auth.signInSub")}
      </p>
    </div>
  );
}
