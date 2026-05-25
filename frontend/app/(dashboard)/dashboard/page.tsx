import Link from "next/link";
import { Bell, Clock, Layers, Plus, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { WatchList, WatchListSkeleton } from "@/components/dashboard/watch-list";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { NextCheckCountdown } from "@/components/dashboard/next-check-countdown";
import { QuickAddBrand } from "@/components/dashboard/quick-add-brand";
import { cn } from "@/lib/utils";
import { getSubscription, getCurrentUser, getWatches } from "@/lib/data/watches";
import { PLAN_LIMITS, type WatchStatus } from "@/lib/supabase/types";
import { getLocale, getTranslations } from "next-intl/server";
import { UpgradeSuccessBanner } from "@/components/dashboard/upgrade-success-banner";

function relativeTime(iso: string | null, t: any): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 10) return t("dashboard.relativeTime.now");
  if (sec < 60) return t("dashboard.relativeTime.sec", { n: sec });
  const min = Math.floor(sec / 60);
  if (min < 60) return t("dashboard.relativeTime.min", { n: min });
  const hours = Math.floor(min / 60);
  if (hours < 24) return t("dashboard.relativeTime.hour", { n: hours });
  return t("dashboard.relativeTime.day", { n: Math.floor(hours / 24) });
}

function inStockCount(watches: { last_status: WatchStatus; is_active: boolean }[]): number {
  return watches.filter((w) => w.is_active && w.last_status === "IN_STOCK").length;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string }>;
}) {
  const locale = await getLocale();
  const isUpgradeSuccess = (await searchParams).upgrade === "success";
  return (
    <Suspense fallback={<DashboardLoading />}>
      {isUpgradeSuccess && <UpgradeSuccessBanner />}
      <AutoRefresh intervalSeconds={60} />
      <div suppressHydrationWarning>
        <DashboardContent locale={locale} />
      </div>
    </Suspense>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-6 w-36 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-64 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/60" />
        ))}
      </div>
      <WatchListSkeleton />
    </div>
  );
}

async function DashboardContent({ locale }: { locale: string }) {
  const [user, watches, subscription] = await Promise.all([
    getCurrentUser(),
    getWatches(),
    getSubscription(),
  ]);

  const t = await getTranslations();
  const firstName = (user?.user_metadata?.first_name as string) || null;
  const preferredBrands: string[] = (user?.user_metadata?.preferred_brands as string[]) ?? [];
  const max = PLAN_LIMITS[subscription.plan];
  const activeCount = watches.filter((w) => w.is_active).length;
  const pausedCount = watches.filter((w) => !w.is_active).length;
  const isLimitReached = activeCount >= max;

  const lastCheck = watches
    .map((w) => w.last_check)
    .filter(Boolean)
    .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0] ?? null;

  const stocked = inStockCount(watches);
  const checkIntervalMin = subscription.plan === "pro" ? 5 : 30;
  const isPro = subscription.plan === "pro";

  const dateStr = new Date().toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const greetingText = firstName
    ? t("dashboard.greeting.withParam", { name: firstName })
    : t("dashboard.greeting.fallback");
  const emptyTitleText = firstName
    ? t("dashboard.emptyTitle.withParam", { name: firstName })
    : t("dashboard.emptyTitle.fallback");

  const stats = [
    {
      label: t("dashboard.stats.activeAlerts"),
      value: `${activeCount} / ${max}`,
      sub: pausedCount > 0 ? t("dashboard.stats.paused", { n: pausedCount }) : undefined,
      icon: Bell,
      color: "text-[var(--brand-orange)]",
      bg: "bg-[var(--brand-orange)]/10",
      ring: "ring-[var(--brand-orange)]/20",
      progress: activeCount / Math.max(max, 1),
      progressColor: "bg-[var(--brand-orange)]",
    },
    {
      label: t("dashboard.stats.inStock"),
      value: String(stocked),
      sub: stocked > 0 ? t("dashboard.stats.inStockSub") : t("dashboard.stats.inStockSub"),
      icon: TrendingUp,
      color: stocked > 0 ? "text-emerald-600" : "text-ink/40",
      bg: stocked > 0 ? "bg-emerald-50" : "bg-muted/30",
      ring: "ring-emerald-500/20",
      alert: stocked > 0,
    },
    {
      label: t("dashboard.stats.lastCheck"),
      value: relativeTime(lastCheck, t),
      sub: t("dashboard.stats.workerActive"),
      icon: Clock,
      color: "text-[var(--brand-blue)]",
      bg: "bg-[var(--brand-blue)]/10",
      ring: "ring-[var(--brand-blue)]/20",
      live: true,
    },
    {
      label: t("dashboard.stats.plan"),
      value: isPro ? "Pro" : "Free",
      sub: t("dashboard.stats.manage"),
      subHref: "/upgrade",
      icon: Layers,
      color: isPro ? "text-amber-600" : "text-ink/50",
      bg: isPro ? "bg-amber-50" : "bg-muted/30",
      ring: isPro ? "ring-amber-500/20" : "ring-ink/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting + header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {dateStr}
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {firstName ? (
              <>
                <span className="relative inline-block">
                  <span className="relative z-10">{greetingText}</span>
                  <span
                    aria-hidden
                    className="absolute inset-x-[-4px] bottom-1 -z-0 block h-[0.25em] -rotate-1 bg-[var(--brand-lime)]"
                  />
                </span>{" "}
                <span className="inline-block animate-[wave_1.2s_ease-in-out_infinite] origin-[70%_70%]">
                  👋
                </span>
              </>
            ) : (
              <span>{greetingText}</span>
            )}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <NextCheckCountdown
            lastCheck={lastCheck}
            intervalMinutes={checkIntervalMin}
            plan={subscription.plan}
          />

          {!isLimitReached ? (
            <Link
              href="/dashboard/add"
              className={cn(
                buttonVariants({ size: "lg" }),
                "group relative w-full gap-2 overflow-hidden rounded-xl border-2 border-ink bg-[var(--brand-orange)] font-display font-bold uppercase tracking-widest text-ink shadow-brutal-sm transition-all hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 sm:w-auto",
              )}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Plus className="relative h-4 w-4" />
              <span className="relative">{t("dashboard.addAlert")}</span>
            </Link>
          ) : (
            <Link
              href="/upgrade"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "group relative w-full gap-2 overflow-hidden rounded-xl border-2 border-ink bg-ink font-display font-bold uppercase tracking-widest text-cream shadow-brutal-sm transition-all hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 sm:w-auto",
              )}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Sparkles className="relative h-4 w-4" />
              <span className="relative">{t("dashboard.upgradeToPro")}</span>
            </Link>
          )}
        </div>
      </header>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => {
          const card = (
            <Card
              key={s.label}
              className={cn(
                "group relative overflow-hidden rounded-2xl border-2 border-ink/20 bg-cream/50 shadow-none transition-all duration-300",
                "hover:border-ink/40 hover:shadow-brutal-sm hover:-translate-y-0.5",
                s.alert && "border-emerald-400/60 bg-emerald-50/30",
              )}
            >
              {s.progress !== undefined && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
                  <div
                    className={cn(
                      "h-full transition-all duration-700 ease-out",
                      s.progressColor,
                    )}
                    style={{ width: `${Math.min(s.progress * 100, 100)}%` }}
                  />
                </div>
              )}

              <CardContent className="relative flex items-start gap-3 p-4 pb-5">
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                    s.bg,
                    "group-hover:scale-105",
                    s.live && "ring-2 ring-offset-1 ring-offset-cream animate-pulse",
                    s.ring,
                  )}
                >
                  <s.icon className={cn("h-4.5 w-4.5", s.color)} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-ink/50">
                    {s.label}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 truncate font-display text-xl font-bold tracking-tight",
                      s.alert && "text-emerald-700",
                    )}
                  >
                    {s.value}
                  </p>
                  {s.sub && (
                    <p className="mt-0.5 truncate text-[11px] text-ink/40">{s.sub}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
          if (s.subHref) {
            return (
              <Link key={s.label} href={s.subHref} className="block">
                {card}
              </Link>
            );
          }
          return card;
        })}
      </div>

      {/* Quick add brands */}
      {preferredBrands.length > 0 && (
        <QuickAddBrand brands={preferredBrands} />
      )}

      {/* Limit warning */}
      {isLimitReached && watches.length > 0 ? (
        <div className="flex flex-col gap-4 rounded-2xl border-2 border-[var(--brand-orange)]/40 bg-[var(--brand-orange)]/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-orange)]/20">
              <Zap className="h-4 w-4 text-[var(--brand-orange)]" />
            </span>
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-widest">
                {t("dashboard.limitReached")}
              </p>
              <p className="mt-0.5 text-sm text-ink/70">
                {t("dashboard.limitBody", { active: activeCount, plan: subscription.plan, max })}
              </p>
            </div>
          </div>
          <Link
            href="/upgrade"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "shrink-0 gap-1.5 rounded-xl border-2 border-ink bg-ink font-bold text-cream",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("dashboard.upgradeToPro")}
          </Link>
        </div>
      ) : null}

      {/* Watch list / empty state */}
      {watches.length === 0 ? (
        <EmptyState firstName={firstName} emptyTitleText={emptyTitleText} emptyBody={t("dashboard.emptyBody")} emptyCta={t("dashboard.emptyCta")} emptyFooter={t("dashboard.emptyFooter")} />
      ) : (
        <WatchList watches={watches} />
      )}
    </div>
  );
}

function EmptyState({
  firstName,
  emptyTitleText,
  emptyBody,
  emptyCta,
  emptyFooter,
}: {
  firstName: string | null;
  emptyTitleText: string;
  emptyBody: string;
  emptyCta: string;
  emptyFooter: string;
}) {
  return (
    <Card className="rounded-3xl border-2 border-dashed border-ink/30 bg-cream/50">
      <CardContent className="flex flex-col items-center gap-6 p-8 text-center sm:p-14">
        <div className="relative">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-ink bg-[var(--brand-lime)] shadow-brutal transition-transform hover:rotate-3">
            <Bell className="h-7 w-7 text-ink" />
          </span>
          <span className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-[var(--brand-orange)] text-[10px] font-black text-ink animate-bounce">
            1
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
            {emptyTitleText}
          </h2>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink/60">
            {emptyBody}
          </p>
        </div>
        <Link
          href="/dashboard/add"
          className={cn(
            buttonVariants({ size: "lg" }),
            "group relative w-full gap-2 overflow-hidden rounded-xl border-2 border-ink bg-[var(--brand-orange)] px-8 font-display font-bold uppercase tracking-widest text-ink shadow-brutal transition-all hover:shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5 sm:w-auto",
          )}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <Plus className="relative h-4 w-4" />
          <span className="relative">{emptyCta}</span>
        </Link>
        <p className="text-xs text-ink/30">
          {emptyFooter}
        </p>
      </CardContent>
    </Card>
  );
}
