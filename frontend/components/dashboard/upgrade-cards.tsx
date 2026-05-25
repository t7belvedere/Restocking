"use client";

import { Check, ExternalLink, Sparkles, Zap } from "lucide-react";
import { useTransition } from "react";
import { useLocale } from "@/components/site/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createCheckoutSession, createPortalSession } from "@/app/actions/stripe";

interface UpgradeCardsProps {
  currentPlan: "free" | "pro";
}

export function UpgradeCards({ currentPlan }: UpgradeCardsProps) {
  const [pending, startTransition] = useTransition();
  const { t } = useLocale();
  const uc = t.dashboard.upgradeCards;

  function checkout(interval: "monthly" | "annual") {
    startTransition(() => createCheckoutSession(interval));
  }

  function portal() {
    startTransition(() => createPortalSession());
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
      {/* FREE */}
      <Card
        className={cn(
          "relative flex flex-col rounded-3xl border-2 border-ink/30 bg-cream/50 shadow-none transition-shadow hover:shadow-brutal",
          currentPlan === "free" && "border-ink",
        )}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-2xl">{t.common.free}</CardTitle>
            {currentPlan === "free" ? (
              <Badge variant="muted" className="border-ink/30 font-bold">
                {uc.currentPlan}
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{uc.freeTitle}</p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between space-y-6">
          <div>
            <div className="flex items-baseline gap-1">
              <p className="font-display text-5xl font-extrabold tracking-tighter">{uc.freePrice}</p>
              <span className="text-sm text-muted-foreground">{uc.freeUnit}</span>
            </div>
          </div>
          <ul className="space-y-2.5 text-sm">
            {uc.freeFeatures.map((f) => (
              <Feature key={f}>{f}</Feature>
            ))}
          </ul>
          <Button type="button" variant="outline" className="w-full rounded-xl border-2" disabled>
            {currentPlan === "free" ? uc.currentPlan : uc.downgrade}
          </Button>
        </CardContent>
      </Card>

      {/* PRO */}
      <Card
        className={cn(
          "relative flex flex-col overflow-hidden rounded-3xl border-2 bg-[var(--brand-orange)]/10 shadow-brutal transition-shadow hover:shadow-brutal-lg",
          currentPlan === "pro" ? "border-ink bg-[var(--brand-orange)]/20" : "border-ink",
        )}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--brand-orange)]/20 blur-3xl" />

        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-2xl">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[var(--brand-orange)]" />
                {t.common.pro}
              </span>
            </CardTitle>
            {currentPlan === "pro" ? (
              <Badge variant="success" className="font-bold">
                {uc.currentPlan}
              </Badge>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-[var(--brand-lime)] px-3 py-1 font-display text-xs font-bold uppercase tracking-widest shadow-brutal-sm">
                <Zap className="h-3 w-3 fill-ink" />
                {uc.recommended}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{uc.proTitle}</p>
        </CardHeader>

        <CardContent className="relative flex flex-1 flex-col justify-between space-y-6">
          <div>
            <div className="flex items-baseline gap-2">
              <p className="font-display text-5xl font-extrabold tracking-tighter">{uc.proPrice}</p>
              <span className="text-sm text-muted-foreground">{uc.proUnit}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{uc.proAnnual}</p>
          </div>

          <ul className="space-y-2.5 text-sm">
            {uc.proFeatures.map((f) => (
              <Feature key={f}>{f}</Feature>
            ))}
          </ul>

          {currentPlan === "pro" ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full rounded-xl border-2"
              onClick={portal}
              disabled={pending}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {uc.manageStripe}
            </Button>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Button
                type="button"
                size="lg"
                className="w-full rounded-xl bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90"
                onClick={() => checkout("monthly")}
                disabled={pending}
              >
                {pending ? (
                  uc.redirectingStripe
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {uc.monthlyCta}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full rounded-xl border-2"
                onClick={() => checkout("annual")}
                disabled={pending}
              >
                {pending ? (
                  uc.redirecting
                ) : (
                  uc.annualCta
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      <span className="text-ink/80">{children}</span>
    </li>
  );
}
