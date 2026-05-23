"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/components/site/locale-provider";

export default function NotFound() {
  const { t } = useLocale();
  return (
    <main className="flex min-h-[80dvh] items-center justify-center px-5 py-20 lg:px-8">
      <div className="max-w-xl space-y-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink/60">
          404
        </p>
        <h1 className="font-display text-6xl font-extrabold leading-none tracking-tighter md:text-8xl">
          Lost in the wardrobe.
        </h1>
        <p className="text-base text-ink/70">
          {t === undefined
            ? "This page does not exist (anymore)."
            : "Cette URL n’existe pas (ou plus). On te ramène à la page d’accueil ?"}
        </p>
        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-ink bg-ink px-5 font-display text-sm font-bold uppercase tracking-wide text-cream shadow-brutal hover-press"
          >
            {t?.common?.backHome ?? "Back home"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
