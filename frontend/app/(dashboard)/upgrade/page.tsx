import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
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
        Retour au dashboard
      </Link>

      <header className="space-y-3 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-[var(--brand-lime)] px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] shadow-brutal-sm">
          <Sparkles className="h-3.5 w-3.5 text-ink" />
          {subscription.plan === "free" ? "Débloque tout" : "Ton plan"}
        </span>
        <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          {subscription.plan === "free"
            ? "Passe en Pro, ne rate plus jamais ta taille"
            : "Gère ton abonnement"}
        </h1>
        <p className="mx-auto max-w-lg text-sm text-muted-foreground">
          {subscription.plan === "free"
            ? "Plus de produits, des checks plus rapides, des alertes SMS. Annulable en deux clics."
            : "Modifie, mets en pause ou annule ton plan Pro depuis le portail Stripe."}
        </p>
      </header>

      <UpgradeCards currentPlan={subscription.plan} />

      <p className="text-center text-xs text-muted-foreground">
        Paiement sécurisé via Stripe. Annulable à tout moment, sans engagement.
      </p>
    </div>
  );
}
