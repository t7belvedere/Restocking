"use client";

import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UpgradeCardsProps {
  currentPlan: "free" | "pro";
}

export function UpgradeCards({ currentPlan }: UpgradeCardsProps) {
  function notifySoon(label: string) {
    toast.info(`Paiement bientôt disponible — on vous préviendra ! (${label})`);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card
        className={cn(
          "relative",
          currentPlan === "free" && "ring-1 ring-foreground/10",
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-xl">Free</CardTitle>
            {currentPlan === "free" ? (
              <Badge variant="muted">Plan actuel</Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Pour démarrer en douceur.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="font-display text-4xl font-semibold">0 €</p>
            <p className="text-xs text-muted-foreground">Pour toujours</p>
          </div>
          <ul className="space-y-2 text-sm">
            <Feature>3 produits surveillés</Feature>
            <Feature>Vérification toutes les 15 min</Feature>
            <Feature>Notifications email</Feature>
          </ul>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={currentPlan === "free"}
          >
            {currentPlan === "free" ? "Plan actuel" : "Repasser en Free"}
          </Button>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "relative overflow-hidden border-foreground/15 bg-gradient-to-b from-accent/40 to-card",
          currentPlan === "pro" && "ring-1 ring-foreground/20",
        )}
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/60 blur-3xl" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-xl">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Pro
              </span>
            </CardTitle>
            {currentPlan === "pro" ? (
              <Badge variant="success">Plan actuel</Badge>
            ) : (
              <Badge variant="default">Recommandé</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Pour ne rien rater, jamais.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-baseline gap-2">
            <p className="font-display text-4xl font-semibold">7,99 €</p>
            <p className="text-sm text-muted-foreground">/ mois</p>
          </div>
          <p className="text-xs text-muted-foreground">
            ou <span className="font-medium text-foreground">59 €/an</span>{" "}
            (deux mois offerts)
          </p>
          <ul className="space-y-2 text-sm">
            <Feature>20 produits surveillés</Feature>
            <Feature>Vérification toutes les 5 min</Feature>
            <Feature>Notifications email + SMS</Feature>
            <Feature>Historique illimité</Feature>
          </ul>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              size="lg"
              onClick={() => notifySoon("Pro mensuel")}
            >
              Choisir Pro mensuel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => notifySoon("Pro annuel")}
            >
              Choisir Pro annuel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
      <span>{children}</span>
    </li>
  );
}
