import Link from "next/link";
import { ArrowRight, Bell, ShieldCheck, Sparkles, Timer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div
        aria-hidden
        className="surface-grain pointer-events-none absolute inset-0 -z-10"
      />
      <header className="container mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
            <Bell className="h-4 w-4" />
          </span>
          Restocking
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            Créer un compte
          </Link>
        </nav>
      </header>

      <main className="container mx-auto max-w-6xl px-6 pb-24 pt-12 lg:pt-20">
        <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Mode EU · Alertes par taille
            </span>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Votre taille,
              <br />
              dès qu’elle revient.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Restocking surveille en continu les produits mode européens et
              vous prévient à l’instant où votre taille — vraiment la vôtre —
              repasse en stock. Plus de F5, plus de listes d’attente sans
              suite.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "px-6",
                )}
              >
                Activer ma première alerte
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                J’ai déjà un compte
              </Link>
            </div>
            <dl className="grid grid-cols-3 gap-6 pt-6 text-sm">
              <div>
                <dt className="text-muted-foreground">Marques surveillées</dt>
                <dd className="mt-1 font-display text-2xl font-semibold">
                  120+
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Délai moyen alerte</dt>
                <dd className="mt-1 font-display text-2xl font-semibold">
                  &lt; 5 min
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Tailles surveillées</dt>
                <dd className="mt-1 font-display text-2xl font-semibold">
                  EU 34–50
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-accent/40 blur-3xl" />
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Aperçu
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  En stock
                </span>
              </div>
              <div className="mt-4 flex gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=300&q=80"
                    alt="Manteau en laine"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-display text-lg font-semibold leading-tight">
                    Manteau oversize en laine
                  </p>
                  <p className="text-sm text-muted-foreground">cos.com</p>
                  <p className="mt-2 text-sm">
                    <span className="rounded-md bg-muted px-2 py-0.5 font-medium">
                      Taille S / Bleu marine
                    </span>
                  </p>
                  <p className="mt-2 text-sm font-medium">250,00 €</p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <Timer className="h-3.5 w-3.5" />
                Vérifié il y a 3 minutes · source dataLayer
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: <Bell className="h-5 w-5" />,
              title: "Alerte exacte par taille",
              text: "On surveille la variante précise — taille, couleur — pas seulement la fiche produit.",
            },
            {
              icon: <Timer className="h-5 w-5" />,
              title: "Vérifications fréquentes",
              text: "Toutes les 15 minutes en Free, toutes les 5 minutes en Pro. Sans dépasser les retailers.",
            },
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              title: "Respect du retailer",
              text: "Lecture publique uniquement. Pas de scraping agressif, pas de revente de données.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                {f.icon}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
