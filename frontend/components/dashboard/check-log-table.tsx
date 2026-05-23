import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CheckLog, WatchStatus } from "@/lib/supabase/types";
import { formatDateTime, formatPrice } from "@/lib/utils";

const STATUS_LABEL: Record<WatchStatus, string> = {
  IN_STOCK: "En stock",
  OUT_OF_STOCK: "Rupture",
  UNKNOWN: "Inconnu",
};

function statusVariant(status: WatchStatus) {
  if (status === "IN_STOCK") return "success" as const;
  if (status === "OUT_OF_STOCK") return "warning" as const;
  return "muted" as const;
}

const SOURCE_LABEL: Record<string, string> = {
  dataLayer: "dataLayer",
  add_to_cart_btn: "Bouton panier",
  variant_attr: "Attribut variante",
  playwright: "Playwright",
};

export function CheckLogTable({ logs }: { logs: CheckLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card/60 p-8 text-center text-sm text-muted-foreground">
        En attente du premier check…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Source signal</TableHead>
            <TableHead className="text-right">Prix</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {formatDateTime(log.checked_at)}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(log.status)}>
                  {STATUS_LABEL[log.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {log.signal_source ? SOURCE_LABEL[log.signal_source] ?? log.signal_source : "—"}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatPrice(log.price)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
