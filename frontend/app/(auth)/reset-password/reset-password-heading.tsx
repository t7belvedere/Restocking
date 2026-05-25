"use client";

import { LockKeyhole } from "lucide-react";
import { useTranslations } from "next-intl";

export function ResetPasswordHeading() {
  const t = useTranslations();

  return (
    <div className="max-w-lg space-y-5 text-center lg:text-left">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-ink bg-[var(--brand-orange)] shadow-brutal-sm">
        <LockKeyhole className="h-6 w-6 text-ink" />
      </div>
      <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-ink md:text-5xl lg:text-[4rem]">
        {t("auth.resetPasswordTitle")}
      </h1>
      <p className="text-lg leading-relaxed text-ink/70">
        {t("auth.resetPasswordSub")}
      </p>
    </div>
  );
}
