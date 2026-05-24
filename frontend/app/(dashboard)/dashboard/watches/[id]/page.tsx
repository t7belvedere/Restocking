import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckLogTable } from "@/components/dashboard/check-log-table";
import { WatchActions } from "@/components/dashboard/watch-actions";
import { LiveStatus } from "@/components/dashboard/live-status";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { getCheckLogs, getWatch } from "@/lib/data/watches";
import { formatPrice, shortHost } from "@/lib/utils";
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

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <AutoRefresh intervalSeconds={20} />

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t.backToAlerts}
      </Link>

      <Card className="rounded-2xl border-2 border-ink/20 shadow-none sm:rounded-3xl">
        <CardContent className="flex flex-col gap-5 p-4 sm:flex-row sm:gap-6 sm:p-6">
          <div className="mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-muted sm:mx-0 sm:h-40 sm:w-40">
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
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            {/* Top row: name + status */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <h1 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
                  {watch.name ?? t.untitled}
                </h1>
                <a
                  href={watch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
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

            {/* Meta */}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
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
                <dd className="mt-0.5 font-medium">{formatPrice(watch.price)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t.createdAt}
                </dt>
                <dd className="mt-0.5 font-medium tabular-nums">
                  {new Date(watch.created_at).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")}
                </dd>
              </div>
            </dl>

            <Separator className="bg-ink/10" />

            <WatchActions id={watch.id} isActive={watch.is_active} />
          </div>
        </CardContent>
      </Card>

      {/* Check log history */}
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
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/20 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink/50">
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
