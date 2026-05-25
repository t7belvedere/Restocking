"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { UpgradeCards } from "@/components/dashboard/upgrade-cards";
import { useTranslations } from "next-intl";

type Props = { plan: "free" | "pro" };

export function UpgradePageClient({ plan }: Props) {
  const t = useTranslations();

  const isFree = plan === "free";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("watchDetail.backToAlerts")}
      </Link>

      <header className="space-y-3 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[var(--brand-lime)] px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] shadow-brutal-sm">
          <Sparkles className="h-3.5 w-3.5 text-ink" />
          {isFree ? t("dashboard.upgradeCta") : t("dashboard.myPlan")}
        </span>
        <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          {isFree ? t("dashboard.upgradeTitle") : t("dashboard.managePlan")}
        </h1>
        <p className="mx-auto max-w-lg text-sm text-muted-foreground">
          {isFree ? t("dashboard.upgradeSub") : t("dashboard.manageSub")}
        </p>
      </header>

      <UpgradeCards currentPlan={plan} />

      <p className="text-center text-xs text-muted-foreground">
        {t("dashboard.securePayment")}
      </p>
    </div>
  );
}
