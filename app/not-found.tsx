import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="max-w-md space-y-4 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Erreur 404
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Page introuvable
        </h1>
        <p className="text-sm text-muted-foreground">
          Cette URL n&apos;existe pas (ou plus). Retour au tableau de bord ?
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Accueil
          </Link>
          <Link href="/dashboard" className={cn(buttonVariants())}>
            Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
