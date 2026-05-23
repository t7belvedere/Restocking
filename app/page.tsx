import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const RETAILERS = [
  "Zara",
  "COS",
  "Uniqlo",
  "Aritzia",
  "Mango",
  "Sézane",
  "ASOS",
  "Arket",
];

const FEATURES = [
  {
    icon: "⚡",
    title: "Alerte en moins de 5 min",
    description:
      "Détection toutes les 5 minutes pour les abonnés Pro. Avant que la taille soit repartie.",
  },
  {
    icon: "🎯",
    title: "Spécifique à ta taille",
    description:
      "Pas d'alerte inutile. On surveille exactement la taille et la couleur que tu veux.",
  },
  {
    icon: "🛍️",
    title: "Tes retailers préférés",
    description:
      "Zara, COS, Uniqlo, Aritzia, Mango, Sézane — les marques mode EU mid-market.",
  },
  {
    icon: "✅",
    title: "Zéro faux positif",
    description:
      "Double confirmation avant chaque alerte. On ne te dérange que quand c'est vraiment en stock.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b">
        <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold tracking-tight">restocking.app</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className={buttonVariants({ size: "sm" })}
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 space-y-8">
        <div className="space-y-4 max-w-2xl">
          <Badge variant="secondary" className="text-xs">
            Beta — Gratuit pour commencer
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Colle l&apos;URL, choisis ta taille.
            <br />
            <span className="text-muted-foreground">
              On t&apos;alerte avant que ce soit reparti.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Les alertes natives de Zara ou Aritzia arrivent 45 min trop tard.
            Restocking surveille toutes les 5 minutes, par taille exacte, et
            t&apos;envoie un email au restock.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: "lg" }), "px-8")}
          >
            Commencer gratuitement
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            J&apos;ai déjà un compte
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          Plan Free — 3 produits, aucune carte bancaire requise
        </p>
      </section>

      {/* Retailers */}
      <section className="border-t bg-muted/30 py-10">
        <div className="container max-w-5xl mx-auto px-4 text-center space-y-4">
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
            Retailers supportés
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {RETAILERS.map((retailer) => (
              <Badge key={retailer} variant="outline" className="text-sm py-1 px-3">
                {retailer}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="space-y-2">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t py-16 px-4 bg-muted/30">
        <div className="container max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Tarifs simples</h2>
            <p className="text-muted-foreground text-sm">
              Commence gratuitement. Passe à Pro quand tu en as besoin.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="border rounded-xl p-6 bg-background space-y-4">
              <div>
                <p className="font-semibold text-lg">Free</p>
                <p className="text-3xl font-bold">0€</p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ 3 produits surveillés</li>
                <li>✓ Check toutes les 30 min</li>
                <li>✓ Alertes email</li>
              </ul>
              <Link
                href="/signup"
                className={buttonVariants({ variant: "outline", className: "w-full" })}
              >
                Commencer
              </Link>
            </div>
            <div className="border-2 border-foreground rounded-xl p-6 bg-background space-y-4 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs">
                Recommandé
              </Badge>
              <div>
                <p className="font-semibold text-lg">Pro</p>
                <p className="text-3xl font-bold">
                  7,99€
                  <span className="text-base font-normal text-muted-foreground">/mois</span>
                </p>
                <p className="text-xs text-muted-foreground">ou 59€/an (~4,90€/mois)</p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ 20 produits surveillés</li>
                <li>✓ Check toutes les 5 min</li>
                <li>✓ Alertes email + SMS</li>
                <li>✓ Priorité dans la queue</li>
              </ul>
              <Link
                href="/signup"
                className={buttonVariants({ className: "w-full" })}
              >
                Essayer Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 px-4">
        <div className="container max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>© 2025 restocking.app</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">Confidentialité</Link>
            <Link href="/terms" className="hover:text-foreground">CGU</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
