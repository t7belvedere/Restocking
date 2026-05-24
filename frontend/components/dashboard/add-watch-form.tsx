"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatPrice, shortHost } from "@/lib/utils";
import { createWatch, type AnalyzeResult } from "@/app/actions/watches";
import { analyzeUrlStream, type ProgressEvent } from "@/lib/analyze-stream";

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
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [manualVariant, setManualVariant] = useState("");
  const [progress, setProgress] = useState<ProgressEvent | null>(null);

  const sizes = analysis?.sizes ?? [];
  const colors = analysis?.colors ?? [];
  const variants = analysis?.variants ?? [];
  // Multi-select: use sizes+colors when available, else fall back to legacy variants
  const hasMultiSelect = sizes.length > 0 && colors.length > 0;
  const hasLegacyVariants = !hasMultiSelect && variants.length > 0;

  const variantLabel = useMemo(() => {
    if (hasMultiSelect) {
      const parts = [selectedSize, selectedColor].filter(Boolean);
      return parts.length > 0 ? parts.join(" / ") : null;
    }
    if (hasLegacyVariants) return selectedVariant;
    return manualVariant.trim() || null;
  }, [hasMultiSelect, hasLegacyVariants, selectedSize, selectedColor, selectedVariant, manualVariant]);

  async function handleAnalyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!url.trim()) return;
    setAnalyzing(true);
    setProgress({ step: "http", message: "Connexion au site..." });
    try {
      const res = await analyzeUrlStream(url.trim(), (evt) => setProgress(evt));
      setAnalysis(res);
      setName(res.name ?? "");
      setSelectedVariant(null);
      setSelectedSize(null);
      setSelectedColor(null);
      setManualVariant("");
      setStep("confirm");
      if (!res.ok || res.enrichment_pending) {
        if (res.error === "TIMEOUT") {
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
      setProgress(null);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!analysis) return;
    if (!variantLabel) {
      if (hasMultiSelect) {
        toast.error("Sélectionnez une taille et une couleur avant d'activer.");
      } else {
        toast.error("Choisissez une taille / couleur avant d'activer.");
      }
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

  const slideAnim = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <AnimatePresence mode="wait">
      {step === "url" || !analysis ? (
        <motion.form key="url" onSubmit={handleAnalyze} className="space-y-4" {...slideAnim} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}>
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

        {analyzing && progress ? (
          <AnalyzeProgress current={progress.step} message={progress.message} />
        ) : null}
      </motion.form>
      ) : (
        <motion.form key="confirm" onSubmit={handleSubmit} className="space-y-6" {...slideAnim} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}>
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
            {analysis.image_url || analysis.image_base64 ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={analysis.image_base64 ? `data:image/jpeg;base64,${analysis.image_base64}` : (analysis.image_url ?? "")}
                alt={analysis.name ?? "Produit"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  // If image URL fails (CDN block), try base64, then hide
                  if (analysis.image_base64 && !e.currentTarget.src.startsWith("data:")) {
                    e.currentTarget.src = `data:image/jpeg;base64,${analysis.image_base64}`;
                  } else {
                    e.currentTarget.style.display = "none";
                  }
                }}
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

      {analysis?.enrichment_pending ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Le site bloque notre lecture automatique. Vous pouvez créer
          l&apos;alerte et notre worker enrichira la fiche dans quelques
          minutes.
        </p>
      ) : null}

      {hasMultiSelect ? (
        <>
          {/* Size selection */}
          <div className="space-y-3">
            <Label>Taille</Label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                const active = selectedSize === s;
                const inStock = analysis?.sizes_status?.[s] ?? true;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={!inStock}
                    onClick={() => { if (inStock) setSelectedSize(active ? null : s); }}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                      "active:scale-[0.97]",
                      !inStock && "opacity-30 line-through cursor-not-allowed border-dashed border-red-200 bg-red-50/50 text-red-400 select-none",
                      inStock && active
                        ? "border-foreground bg-foreground text-background shadow-sm"
                        : inStock
                          ? "border-border bg-background hover:border-foreground/40 hover:bg-muted"
                          : "",
                    )}
                  >
                    {s}{!inStock ? <span className="ml-1 text-[9px] opacity-60">épuisé</span> : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color selection */}
          <div className="space-y-3">
            <Label>Couleur</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => {
                const active = selectedColor === c;
                const inStock = analysis?.colors_status?.[c] ?? true;
                return (
                  <button
                    key={c}
                    type="button"
                    disabled={!inStock}
                    onClick={() => { if (inStock) setSelectedColor(active ? null : c); }}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                      "active:scale-[0.97]",
                      !inStock && "opacity-30 line-through cursor-not-allowed border-dashed border-red-200 bg-red-50/50 text-red-400 select-none",
                      inStock && active
                        ? "border-foreground bg-foreground text-background shadow-sm"
                        : inStock
                          ? "border-border bg-background hover:border-foreground/40 hover:bg-muted"
                          : "",
                    )}
                  >
                    {c}{!inStock ? <span className="ml-1 text-[9px] opacity-60">épuisé</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : hasLegacyVariants ? (
        <div className="space-y-3">
          <Label>Sélectionne ta taille / couleur</Label>
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
          <p className="text-xs text-muted-foreground">
            Sélectionnez la variante exacte que vous souhaitez surveiller.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <Label>Sélectionne ta taille / couleur</Label>
          <Input
            placeholder="ex: Taille S / Bleu marine"
            value={manualVariant}
            onChange={(e) => setManualVariant(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Aucune variante détectée — saisissez la taille / couleur manuellement.
          </p>
        </div>
      )}

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
    </motion.form>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Progress bar — 3 phases shown during URL analysis
// ---------------------------------------------------------------------------

type PhaseKey = "http" | "playwright" | "extracting";

const PHASES: { key: PhaseKey; label: string }[] = [
  { key: "http", label: "Connexion" },
  { key: "playwright", label: "Navigateur" },
  { key: "extracting", label: "Extraction" },
];

const STEP_ORDER: string[] = ["http", "playwright", "playwright_retry", "extracting"];

function AnalyzeProgress({ current, message }: { current: string; message: string }) {
  const currentIdx = STEP_ORDER.indexOf(current);
  // Map "playwright_retry" to the "playwright" phase for display
  const activeKey: PhaseKey = current === "playwright_retry" ? "playwright" : current as PhaseKey;

  return (
    <Card className="mt-4 rounded-2xl border-2 border-ink/20 bg-cream/50">
      <CardContent className="p-5">
        {/* Dots + connectors */}
        <div className="flex items-center justify-center">
          {PHASES.map((phase, i) => {
            const phaseIdx = STEP_ORDER.indexOf(phase.key);
            const isDone = phase.key !== activeKey && currentIdx > phaseIdx;
            const isActive = phase.key === activeKey;

            return (
              <div key={phase.key} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      borderColor: isDone
                        ? "rgb(16 185 129)" // emerald-500
                        : isActive
                          ? "var(--brand-orange)"
                          : "rgb(212 212 216)", // zinc-300
                      backgroundColor: isDone
                        ? "rgb(16 185 129)"
                        : isActive
                          ? "var(--brand-orange)"
                          : "transparent",
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2"
                  >
                    {isDone ? (
                      <Check className="h-3.5 w-3.5 text-white" />
                    ) : isActive ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-ink" />
                    ) : (
                      <span className="text-[10px] font-bold text-ink/25">
                        {i + 1}
                      </span>
                    )}
                  </motion.div>
                  <span
                    className={`text-[10px] font-medium uppercase tracking-wider transition-colors ${
                      isDone
                        ? "text-emerald-600"
                        : isActive
                          ? "text-ink font-bold"
                          : "text-ink/25"
                    }`}
                  >
                    {phase.label}
                  </span>
                </div>

                {/* Connector line */}
                {i < PHASES.length - 1 && (
                  <div className="mx-2 mb-5 h-0.5 w-8 rounded-full overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={{
                        width: isDone ? "100%" : "0%",
                        backgroundColor: isDone ? "rgb(16 185 129)" : "rgb(212 212 216)",
                      }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current action text */}
        <motion.p
          key={current}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center text-xs text-ink/50"
        >
          {message}
        </motion.p>
      </CardContent>
    </Card>
  );
}
