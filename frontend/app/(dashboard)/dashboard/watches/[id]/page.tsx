import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckLogTable } from "@/components/dashboard/check-log-table";
import { WatchActions } from "@/components/dashboard/watch-actions";
import { LiveStatus } from "@/components/dashboard/live-status";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { getCheckLogs, getWatch } from "@/lib/data/watches";
import { formatPrice, shortHost, cn } from "@/lib/utils";
import { messages, type Locale } from "@/lib/i18n/messages";

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

function priceTrend(logs: { price: number | null; checked_at: string }[]): "up" | "down" | "stable" | null {
  const withPrice = logs.filter((l) => l.price != null).slice(0, 5);
  if (withPrice.length < 2) return null;
  const latest = withPrice[0].price!;
  const oldest = withPrice[withPrice.length - 1].price!;
  if (latest > oldest) return "up";
  if (latest < oldest) return "down";
  return "stable";
}

export default async function WatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [watch, locale] = await Promise.all([getWatch(id), getLocale()]);
  if (!watch) notFound();

  const logs = await getCheckLogs(id);
  const t = messages[locale].watchDetail;
  const trend = priceTrend(logs);
  const isInStock = watch.last_status === "IN_STOCK" && watch.is_active;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <AutoRefresh intervalSeconds={20} />

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t.backToAlerts}
      </Link>

      {/* Product card — enhanced with urgency */}
      <Card
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 shadow-none transition-all duration-500 sm:rounded-3xl",
          isInStock
            ? "border-emerald-400/60 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
            : "border-ink/20",
        )}
      >
        {/* Background pulse when in stock */}
        {isInStock && (
          <span className="absolute inset-0 animate-pulse bg-emerald-400/5 pointer-events-none" />
        )}

        <CardContent className="relative flex flex-col gap-5 p-4 sm:flex-row sm:gap-6 sm:p-6">
          <div
            className={cn(
              "relative mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-muted sm:mx-0 sm:h-40 sm:w-40",
              isInStock && "ring-2 ring-emerald-400/60 ring-offset-2 ring-offset-cream",
            )}
          >
            {watch.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={watch.image_url}
                alt={watch.name ?? "Produit"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                {t.noImage}
              </div>
            )}
            {isInStock && (
              <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full border border-emerald-400 bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800 shadow-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                {t.inStock}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            {/* Top row: name + status */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <h1
                  className={cn(
                    "font-display text-2xl font-semibold leading-tight sm:text-3xl",
                    isInStock && "text-emerald-900",
                  )}
                >
                  {watch.name ?? t.untitled}
                </h1>
                <a
                  href={watch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {shortHost(watch.url)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Live pulse indicator */}
              <LiveStatus
                lastCheck={watch.last_check}
                status={watch.last_status}
                isActive={watch.is_active}
              />
            </div>

            <Separator className="bg-ink/10" />

            {/* Meta with price trend indicator */}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t.variant}
                </dt>
                <dd className="mt-0.5 font-medium">{watch.variant_label ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t.price}
                </dt>
                <dd className="mt-0.5 flex items-center gap-1.5 font-medium">
                  {formatPrice(watch.price)}
                  {trend === "up" && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                      <TrendingUp className="h-2.5 w-2.5" />
                    </span>
                  )}
                  {trend === "down" && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      <TrendingDown className="h-2.5 w-2.5" />
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t.createdAt}
                </dt>
                <dd className="mt-0.5 font-medium tabular-nums">
                  {new Date(watch.created_at).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Checks
                </dt>
                <dd className="mt-0.5 font-medium tabular-nums">{logs.length}</dd>
              </div>
            </dl>

            <Separator className="bg-ink/10" />

            <WatchActions id={watch.id} isActive={watch.is_active} />
          </div>
        </CardContent>
      </Card>

      {/* Check log history — now a visual timeline */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">
              {t.checkHistory}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t.checkHistoryDesc}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/20 bg-cream px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink/50">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {t.live}
          </span>
        </div>
        <CheckLogTable logs={logs} watchPrice={watch.price} />
      </section>
    </div>
  );
}
