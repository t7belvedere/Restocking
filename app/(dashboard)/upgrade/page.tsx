import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UpgradeCards } from "@/components/dashboard/upgrade-cards";
import { getSubscription } from "@/lib/data/watches";

export default async function UpgradePage() {
  const subscription = await getSubscription();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour
      </Link>

      <header className="space-y-2 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Plans Restocking
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Passer à Pro
        </h1>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">
          Plus de produits suivis, des vérifications plus fréquentes, et des
          alertes par email + SMS pour ne plus jamais rater votre taille.
        </p>
      </header>

      <UpgradeCards currentPlan={subscription.plan} />

      <p className="text-center text-xs text-muted-foreground">
        Paiement sécurisé via Stripe (à venir). Vous pouvez annuler à tout
        moment.
      </p>
    </div>
  );
}
