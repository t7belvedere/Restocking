import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddWatchForm } from "@/components/dashboard/add-watch-form";
import { getSubscription, getWatches } from "@/lib/data/watches";
import { PLAN_LIMITS } from "@/lib/supabase/types";

export default async function AddWatchPage() {
  const [watches, subscription] = await Promise.all([
    getWatches(),
    getSubscription(),
  ]);
  const max = PLAN_LIMITS[subscription.plan];
  const active = watches.filter((w) => w.is_active).length;
  if (active >= max) {
    redirect("/upgrade");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Mes alertes
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            Nouvelle alerte
          </CardTitle>
          <CardDescription>
            Collez l&apos;URL d&apos;un produit, choisissez votre taille — on
            s&apos;occupe du reste.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddWatchForm />
        </CardContent>
      </Card>
    </div>
  );
}
