"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Check, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatPrice, shortHost } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { createWatch, type AnalyzeResult } from "@/app/actions/watches";
import { analyzeUrlStream, type ProgressEvent } from "@/lib/analyze-stream";

type Step = "url" | "confirm";

// Domaines où l'analyse fonctionne mais avec des limitations (variantes, images...)
const LIMITED_DOMAINS: Record<string, string> = {
  "pullandbear": "Pull&Bear",
  "weekday": "Weekday",
  "stradivarius": "Stradivarius",
  "arket": "ARKET",
  "monki": "Monki",
  "stories.com": "& Other Stories",
  "ginatricot": "Gina Tricot",
  "massimodutti": "Massimo Dutti",
  "oysho": "Oysho",
  "lefties": "Lefties",
};

// Domaines où l'analyse ne fonctionne pas du tout
const BLOCKED_DOMAINS: Record<string, string> = {
  "shein": "Shein",
  "sephora": "Sephora",
  "louisvuitton": "Louis Vuitton",
};

type DomainStatus = { label: string; level: "limited" | "blocked" } | null;

function getDomainWarning(url: string): DomainStatus {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    for (const [keyword, label] of Object.entries(BLOCKED_DOMAINS)) {
      if (hostname.includes(keyword)) return { label, level: "blocked" };
    }
    for (const [keyword, label] of Object.entries(LIMITED_DOMAINS)) {
      if (hostname.includes(keyword)) return { label, level: "limited" };
    }
  } catch {}
  return null;
}

export function AddWatchForm() {
  const router = useRouter();
  const t = useTranslations();
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

  const domainWarning = useMemo(() => getDomainWarning(url), [url]);

  const sizes = analysis?.sizes ?? [];
  const colors = analysis?.colors ?? [];
  const variants = analysis?.variants ?? [];
  const priceMap = analysis?.price_map ?? {};

  // Price for the currently selected variant (falls back to base price)
  const displayPrice = useMemo(() => {
    const base = analysis?.price;
    // Try selectedSize+Color combo first, then just size, then just color
    const parts = [selectedSize, selectedColor].filter(Boolean);
    const key = parts.join(" / ");
    if (key && priceMap[key] !== undefined) return priceMap[key];
    if (selectedSize && priceMap[selectedSize] !== undefined) return priceMap[selectedSize];
    if (selectedColor && priceMap[selectedColor] !== undefined) return priceMap[selectedColor];
    return base;
  }, [analysis?.price, priceMap, selectedSize, selectedColor]);
  // Multi-select: use sizes+colors when available, else fall back to legacy variants
  // Show size/color selectors whenever we have structured variant data
  // (with or without colors — perfumes only have sizes, e.g.)
  const hasSizes = sizes.length > 0;
  const hasColors = colors.length > 0;
  const hasMultiSelect = hasSizes || hasColors;
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
    setProgress({ step: "http", message: t("addWatch.progressHttp") });
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
          toast.warning(t("addWatch.partialAnalysis"));
        } else {
          toast.warning(t("addWatch.couldNotRead"));
        }
      }
    } catch {
      toast.error(t("addWatch.networkError"));
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
        toast.error(t("addWatch.selectSizeColor"));
      } else {
        toast.error(t("addWatch.chooseVariant"));
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
          toast.error(t("addWatch.limitReached"));
          router.push("/upgrade");
          return;
        }
        if (res.error === "INVALID_URL") {
          toast.error(t("addWatch.invalidUrl"));
          return;
        }
        toast.error(t("addWatch.createFailed"));
        return;
      }

      toast.success(t("addWatch.activated"));
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
          <Label htmlFor="product-url">{t("addWatch.urlLabel")}</Label>
          <Input
            id="product-url"
            type="url"
            inputMode="url"
            required
            placeholder={t("addWatch.urlPlaceholder")}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={analyzing}
          />
          <p className="text-xs text-muted-foreground">{t("addWatch.urlHelp")}</p>

          {domainWarning?.level === "blocked" ? (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{t("addWatch.blockedWarning", { brand: domainWarning.label })}</span>
            </div>
          ) : domainWarning?.level === "limited" ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{t("addWatch.limitedWarning", { brand: domainWarning.label })}</span>
            </div>
          ) : null}
        </div>

        <Button type="submit" size="lg" disabled={analyzing} className="w-full">
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("addWatch.analyzing")}
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              {t("addWatch.analyze")}
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
        {t("addWatch.modifyUrl")}
      </button>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
            {analysis.image_url || analysis.image_base64 ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={analysis.image_base64 ? `data:image/jpeg;base64,${analysis.image_base64}` : (analysis.image_url ?? "")}
                alt={analysis.name ?? t("addWatch.productName")}
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
                {t("addWatch.noImage")}
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
                <Label htmlFor="product-name">{t("addWatch.productName")}</Label>
                <Input
                  id="product-name"
                  required
                  placeholder={t("addWatch.productNamePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {shortHost(analysis.url)}
            </p>
            <p className="text-sm font-medium">{formatPrice(displayPrice)}</p>
          </div>
        </CardContent>
      </Card>

      {analysis?.enrichment_pending ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {t("addWatch.enrichmentPending")}
        </p>
      ) : null}

      {hasMultiSelect ? (
        <>
          {/* Size selection */}
          {hasSizes ? (
            <div className="space-y-3">
              <Label>{t("addWatch.size")}</Label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const active = selectedSize === s;
                  const inStock = analysis?.sizes_status?.[s] ?? true;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(active ? null : s)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                        "active:scale-[0.97]",
                        !inStock && active && "border-red-400 bg-red-200 text-red-600 line-through cursor-pointer",
                        !inStock && !active && "border-dashed border-red-200 bg-red-50/50 text-red-400 line-through hover:bg-red-100/50 cursor-pointer",
                        inStock && active && "border-foreground bg-foreground text-background shadow-sm",
                        inStock && !active && "border-border bg-background hover:border-foreground/40 hover:bg-muted",
                      )}
                    >
                      {s}{!inStock ? <span className="ml-1 text-[9px] opacity-60">{t("addWatch.oosBadge")}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Color selection */}
          {hasColors ? (
            <div className="space-y-3">
              <Label>{t("addWatch.color")}</Label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => {
                  const active = selectedColor === c;
                  const inStock = analysis?.colors_status?.[c] ?? true;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(active ? null : c)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                        "active:scale-[0.97]",
                        !inStock && active && "border-red-400 bg-red-200 text-red-600 line-through cursor-pointer",
                        !inStock && !active && "border-dashed border-red-200 bg-red-50/50 text-red-400 line-through hover:bg-red-100/50 cursor-pointer",
                        inStock && active && "border-foreground bg-foreground text-background shadow-sm",
                        inStock && !active && "border-border bg-background hover:border-foreground/40 hover:bg-muted",
                      )}
                    >
                      {c}{!inStock ? <span className="ml-1 text-[9px] opacity-60">{t("addWatch.oosBadge")}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </>
      ) : hasLegacyVariants ? (
        <div className="space-y-3">
          <Label>{t("addWatch.selectVariant")}</Label>
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
          <p className="text-xs text-muted-foreground">{t("addWatch.selectVariantHelp")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <Label>{t("addWatch.selectVariant")}</Label>
          <Input
            placeholder={t("addWatch.manualVariantPlaceholder")}
            value={manualVariant}
            onChange={(e) => setManualVariant(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{t("addWatch.noVariantsHelp")}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/dashboard")}
        >
          {t("addWatch.cancel")}
        </Button>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("addWatch.activating")}
            </>
          ) : (
            t("addWatch.activate")
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

function AnalyzeProgress({ current, message }: { current: string; message: string }) {
  const t = useTranslations();
  const STEP_ORDER: string[] = ["http", "playwright", "playwright_retry", "extracting"];
  const currentIdx = STEP_ORDER.indexOf(current);

  const phases: { key: PhaseKey; label: string }[] = [
    { key: "http", label: t("addWatch.progressPhaseHttp") },
    { key: "playwright", label: t("addWatch.progressPhasePlaywright") },
    { key: "extracting", label: t("addWatch.progressPhaseExtracting") },
  ];
  // Map "playwright_retry" to the "playwright" phase for display
  const activeKey: PhaseKey = current === "playwright_retry" ? "playwright" : current as PhaseKey;

  return (
    <Card className="mt-4 rounded-2xl border-2 border-ink/20 bg-cream/50">
      <CardContent className="p-5">
        {/* Dots + connectors */}
        <div className="flex items-center justify-center">
          {phases.map((phase, i) => {
            const phaseIdx = STEP_ORDER.indexOf(phase.key);
            const isDone = phase.key !== activeKey && currentIdx > phaseIdx;
            const isActive = phase.key === activeKey;

            return (
              <div key={phase.key} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    initial={false}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border-2",
                      isDone && "border-emerald-500 bg-emerald-500",
                      isActive && "border-[var(--brand-orange)] bg-[var(--brand-orange)]",
                      !isDone && !isActive && "border-zinc-300 bg-transparent",
                    )}
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
                {i < phases.length - 1 && (
                  <div className="mx-2 mb-5 h-0.5 w-8 rounded-full overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={{ width: isDone ? "100%" : "0%" }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className={cn(
                        "h-full rounded-full",
                        isDone ? "bg-emerald-500" : "bg-zinc-300",
                      )}
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
