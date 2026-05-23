import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckLogTable } from "@/components/dashboard/check-log-table";
import { WatchActions } from "@/components/dashboard/watch-actions";
import { getCheckLogs, getWatch } from "@/lib/data/watches";
import type { WatchStatus } from "@/lib/supabase/types";
import { formatDateTime, formatPrice, shortHost } from "@/lib/utils";

const STATUS_LABEL: Record<WatchStatus, string> = {
  IN_STOCK: "En stock",
  OUT_OF_STOCK: "Rupture",
  UNKNOWN: "En attente",
};

function StatusBlock({
  status,
  isActive,
  lastCheck,
}: {
  status: WatchStatus;
  isActive: boolean;
  lastCheck: string | null;
}) {
  if (!isActive) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Badge variant="muted" className="px-3 py-1 text-sm">
          En pause
        </Badge>
        <p className="text-xs text-muted-foreground">
          Dernière vérif. {formatDateTime(lastCheck)}
        </p>
      </div>
    );
  }
  const variant =
    status === "IN_STOCK"
      ? "success"
      : status === "OUT_OF_STOCK"
        ? "warning"
        : "muted";
  return (
    <div className="flex flex-col items-end gap-1">
      <Badge variant={variant} className="px-3 py-1 text-sm">
        {STATUS_LABEL[status]}
      </Badge>
      <p className="text-xs text-muted-foreground">
        Dernière vérif. {formatDateTime(lastCheck)}
      </p>
    </div>
  );
}

export default async function WatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const watch = await getWatch(id);
  if (!watch) notFound();

  const logs = await getCheckLogs(id);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Mes alertes
      </Link>

      <Card>
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row">
          <div className="h-40 w-40 shrink-0 overflow-hidden rounded-2xl bg-muted">
            {watch.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={watch.image_url}
                alt={watch.name ?? "Produit"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                Sans visuel
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <h1 className="font-display text-3xl font-semibold leading-tight">
                  {watch.name ?? "Produit sans titre"}
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
              <StatusBlock
                status={watch.last_status}
                isActive={watch.is_active}
                lastCheck={watch.last_check}
              />
            </div>

            <Separator />

            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Variante</dt>
                <dd className="font-medium">
                  {watch.variant_label ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Prix</dt>
                <dd className="font-medium">{formatPrice(watch.price)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Créée le</dt>
                <dd className="font-medium">
                  {formatDateTime(watch.created_at)}
                </dd>
              </div>
            </dl>

            <Separator />

            <WatchActions id={watch.id} isActive={watch.is_active} />
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">
              Historique des vérifications
            </h2>
            <p className="text-sm text-muted-foreground">
              Les 20 derniers checks détectés par notre robot.
            </p>
          </div>
        </div>
        <CheckLogTable logs={logs} />
      </section>
    </div>
  );
}
