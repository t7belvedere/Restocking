import Link from "next/link";
import { Bell, Clock, Layers, Plus, Sparkles, TrendingUp } from "lucide-react";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WatchList, WatchListSkeleton } from "@/components/dashboard/watch-list";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { QuickAddBrand } from "@/components/dashboard/quick-add-brand";
import { cn } from "@/lib/utils";
import { getSubscription, getCurrentUser, getWatches } from "@/lib/data/watches";
import { PLAN_LIMITS, type WatchStatus } from "@/lib/supabase/types";
import { messages, type Locale, type DashboardMessages } from "@/lib/i18n/messages";

function relativeTime(iso: string | null, t: DashboardMessages["relativeTime"]): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 10) return t.now;
  if (sec < 60) return t.sec(sec);
  const min = Math.floor(sec / 60);
  if (min < 60) return t.min(min);
  const hours = Math.floor(min / 60);
  if (hours < 24) return t.hour(hours);
  return t.day(Math.floor(hours / 24));
}

function inStockCount(watches: { last_status: WatchStatus; is_active: boolean }[]): number {
  return watches.filter((w) => w.is_active && w.last_status === "IN_STOCK").length;
}

async function getLocale(): Promise<Locale> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get("restocking.locale")?.value;
    if (cookieLocale && ["fr", "en"].includes(cookieLocale)) {
      return cookieLocale as Locale;
    }
  } catch {}
  return "fr";
}

export default async function DashboardPage() {
  const locale = await getLocale();
  return (
    <Suspense fallback={<DashboardLoading locale={locale} />}>
      <AutoRefresh intervalSeconds={60} />
      <div suppressHydrationWarning>
        <DashboardContent locale={locale} />
      </div>
    </Suspense>
  );
}

function DashboardLoading({ locale }: { locale: Locale }) {
  const t: DashboardMessages = messages[locale].dashboard;
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-6 w-36 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-64 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/60" />
        ))}
      </div>
      <WatchListSkeleton />
    </div>
  );
}

async function DashboardContent({ locale }: { locale: Locale }) {
  const [user, watches, subscription] = await Promise.all([
    getCurrentUser(),
    getWatches(),
    getSubscription(),
  ]);

  const t: DashboardMessages = messages[locale].dashboard;
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

  const dateStr = new Date().toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const stats = [
    {
      label: t.stats.activeAlerts,
      value: `${activeCount} / ${max}`,
      sub: pausedCount > 0 ? t.stats.paused(pausedCount) : undefined,
      icon: Bell,
      color: "text-[var(--brand-orange)]",
      bg: "bg-[var(--brand-orange)]/10",
    },
    {
      label: t.stats.inStock,
      value: String(stocked),
      sub: t.stats.inStockSub,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: t.stats.lastCheck,
      value: relativeTime(lastCheck, t.relativeTime),
      sub: t.stats.workerActive,
      icon: Clock,
      color: "text-[var(--brand-blue)]",
      bg: "bg-[var(--brand-blue)]/10",
    },
    {
      label: t.stats.plan,
      value: subscription.plan === "pro" ? "Pro" : "Free",
      sub: t.stats.manage,
      subHref: "/upgrade",
      icon: Layers,
      color: subscription.plan === "pro" ? "text-amber-600" : "text-ink/60",
      bg: subscription.plan === "pro" ? "bg-amber-50" : "bg-muted/50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting + header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {dateStr}
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {firstName ? (
              <>
                <span className="relative inline-block">
                  <span className="relative z-10">{t.greeting(firstName)}</span>
                  <span
                    aria-hidden
                    className="absolute inset-x-[-4px] bottom-1 -z-0 block h-[0.25em] -rotate-1 bg-[var(--brand-lime)]"
                  />
                </span>{" "}
                👋
              </>
            ) : (
              <span>{t.greeting(null)}</span>
            )}
          </h1>
        </div>

        {!isLimitReached ? (
          <Link
            href="/dashboard/add"
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full gap-2 rounded-xl border-2 border-ink bg-[var(--brand-orange)] font-display font-bold uppercase tracking-widest text-ink shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all sm:w-auto",
            )}
          >
            <Plus className="h-4 w-4" />
            {t.addAlert}
          </Link>
        ) : (
          <Link
            href="/upgrade"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full gap-2 rounded-xl border-2 border-ink bg-ink font-display font-bold uppercase tracking-widest text-cream shadow-brutal-sm hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all sm:w-auto",
            )}
          >
            <Sparkles className="h-4 w-4" />
            {t.upgradeToPro}
          </Link>
        )}
      </header>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => {
          const card = (
            <Card
              key={s.label}
              className={cn(
                "rounded-2xl border-2 border-ink/20 bg-cream/50 shadow-none transition-shadow hover:shadow-brutal-sm",
              )}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <span className={cn("mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", s.bg)}>
                  <s.icon className={cn("h-4 w-4", s.color)} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-ink/50">
                    {s.label}
                  </p>
                  <p className="mt-0.5 truncate font-display text-lg font-bold tracking-tight">
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
        <div className="flex flex-col gap-4 rounded-2xl border-2 border-ink bg-[var(--brand-orange)]/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-widest">
              {t.limitReached}
            </p>
            <p className="mt-0.5 text-sm text-ink/70">
              {t.limitBody(activeCount, subscription.plan, max)}
            </p>
          </div>
          <Link
            href="/upgrade"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "shrink-0 gap-1.5 rounded-xl border-2 border-ink bg-ink font-bold text-cream",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t.upgradeToPro}
          </Link>
        </div>
      ) : null}

      {/* Watch list / empty state */}
      {watches.length === 0 ? (
        <EmptyState firstName={firstName} t={t} />
      ) : (
        <WatchList watches={watches} />
      )}
    </div>
  );
}

function EmptyState({ firstName, t }: { firstName: string | null; t: DashboardMessages }) {
  return (
    <Card className="rounded-3xl border-2 border-dashed border-ink/30 bg-cream/50">
      <CardContent className="flex flex-col items-center gap-6 p-8 text-center sm:p-14">
        <div className="relative">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-[var(--brand-lime)] shadow-brutal sm:h-16 sm:w-16">
            <Bell className="h-6 w-6 text-ink sm:h-7 sm:w-7" />
          </span>
          <span className="absolute -right-2 -top-2 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink bg-[var(--brand-orange)] text-[9px] font-black text-ink sm:h-6 sm:w-6 sm:text-[10px]">
            1
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
            {t.emptyTitle(firstName)}
          </h2>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink/60">
            {t.emptyBody}
          </p>
        </div>
        <Link
          href="/dashboard/add"
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full gap-2 rounded-xl border-2 border-ink bg-[var(--brand-orange)] px-8 font-display font-bold uppercase tracking-widest text-ink shadow-brutal hover:shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all sm:w-auto",
          )}
        >
          <Plus className="h-4 w-4" />
          {t.emptyCta}
        </Link>
        <p className="text-xs text-ink/30">
          {t.emptyFooter}
        </p>
      </CardContent>
    </Card>
  );
}
