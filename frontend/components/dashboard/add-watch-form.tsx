"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatPrice, shortHost } from "@/lib/utils";
import {
  analyzeUrl,
  createWatch,
  type AnalyzeResult,
} from "@/app/actions/watches";

type Step = "url" | "confirm";

export function AddWatchForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("url");
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, startSubmit] = useTransition();

  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [name, setName] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [manualVariant, setManualVariant] = useState("");

  const variants = analysis?.variants ?? [];
  const variantLabel = useMemo(() => {
    if (variants.length > 0) return selectedVariant;
    return manualVariant.trim() || null;
  }, [variants, selectedVariant, manualVariant]);

  async function handleAnalyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!url.trim()) return;
    setAnalyzing(true);
    try {
      const res = await analyzeUrl(url.trim());
      setAnalysis(res);
      setName(res.name ?? "");
      setSelectedVariant(null);
      setManualVariant("");
      setStep("confirm");
      if (!res.ok) {
        if (res.error === "INVALID_URL") {
          toast.error("URL invalide. Vérifiez le lien.");
        } else if (res.error === "TIMEOUT") {
          toast.warning(
            "Analyse partielle — la page a mis trop de temps à répondre.",
          );
        } else {
          toast.warning(
            "On n'a pas pu lire la fiche produit, vous pouvez compléter manuellement.",
          );
        }
      }
    } catch {
      toast.error("Erreur réseau. Réessayez dans un instant.");
    } finally {
      setAnalyzing(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!analysis) return;
    if (!variantLabel) {
      toast.error("Choisissez une taille / couleur avant d'activer.");
      return;
    }

    startSubmit(async () => {
      const res = await createWatch({
        url: analysis.url,
        name: name.trim() || analysis.name || null,
        image_url: analysis.image_url,
        price: analysis.price,
        variant_label: variantLabel,
        variant_id: variantLabel,
      });

      if (!res.ok) {
        if (res.error === "LIMIT_REACHED") {
          toast.error(
            "Limite de votre plan atteinte. Passez à Pro pour en suivre plus.",
          );
          router.push("/upgrade");
          return;
        }
        if (res.error === "INVALID_URL") {
          toast.error("URL invalide.");
          return;
        }
        toast.error("Impossible de créer l'alerte.");
        return;
      }

      toast.success("Alerte activée ✓");
      router.push("/dashboard");
      router.refresh();
    });
  }

  if (step === "url" || !analysis) {
    return (
      <form onSubmit={handleAnalyze} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product-url">URL du produit</Label>
          <Input
            id="product-url"
            type="url"
            inputMode="url"
            required
            placeholder="https://www.cos.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={analyzing}
          />
          <p className="text-xs text-muted-foreground">
            Collez le lien direct de la fiche produit. On lit les balises
            publiques pour pré-remplir le formulaire.
          </p>
        </div>

        <Button type="submit" size="lg" disabled={analyzing} className="w-full">
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyse en cours…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Analyser le produit
            </>
          )}
        </Button>

        {analyzing ? (
          <Card className="mt-2">
            <CardContent className="flex items-center gap-4 p-4">
              <Skeleton className="h-20 w-20 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ) : null}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <button
        type="button"
        onClick={() => setStep("url")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Modifier l&apos;URL
      </button>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
            {analysis.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={analysis.image_url}
                alt={analysis.name ?? "Produit"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                Sans visuel
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            {analysis.name ? (
              <p className="font-display text-lg font-semibold leading-tight">
                {analysis.name}
              </p>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="product-name">Nom du produit</Label>
                <Input
                  id="product-name"
                  required
                  placeholder="ex: Manteau oversize en laine"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {shortHost(analysis.url)}
            </p>
            <p className="text-sm font-medium">{formatPrice(analysis.price)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Label>Sélectionne ta taille / couleur</Label>
        {analysis?.enrichment_pending ? (
          <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Le site bloque notre lecture automatique. Vous pouvez créer
            l&apos;alerte et notre worker enrichira la fiche dans quelques
            minutes.
          </p>
        ) : null}
        {variants.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const active = selectedVariant === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                    "active:scale-[0.97]",
                    active
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "border-border bg-background hover:border-foreground/40 hover:bg-muted",
                  )}
                >
                  {v}
                </button>
              );
            })}
          </div>
        ) : (
          <Input
            placeholder="ex: Taille S / Bleu marine"
            value={manualVariant}
            onChange={(e) => setManualVariant(e.target.value)}
          />
        )}
        <p className="text-xs text-muted-foreground">
          {variants.length > 0
            ? "Sélectionnez la variante exacte que vous souhaitez surveiller."
            : "Aucune variante détectée — saisissez la taille / couleur manuellement."}
        </p>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/dashboard")}
        >
          Annuler
        </Button>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Activation…
            </>
          ) : (
            "Activer l'alerte"
          )}
        </Button>
      </div>
    </form>
  );
}
