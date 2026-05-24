"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/components/site/locale-provider";
import { cn } from "@/lib/utils";
import { RETAILERS, type WordmarkStyle } from "@/lib/data/retailers";
import {
  analyzeUrl,
  createWatch,
  type AnalyzeResult,
} from "@/app/actions/watches";

const BRAND_STYLES: Record<string, { domain: string; wordmark: WordmarkStyle; accent?: "ink" | "orange" | "blue" | "lime" | "red" }> = {};
for (const r of RETAILERS) {
  BRAND_STYLES[r.name] = { domain: r.domain, wordmark: r.wordmark, accent: r.accent };
}

const STYLE_CLASSES: Record<WordmarkStyle, string> = {
  "serif-bold": "font-['Playfair_Display',ui-serif,Georgia,serif] font-black tracking-[0.06em]",
  "serif-italic": "font-['Playfair_Display',ui-serif,Georgia,serif] font-medium italic tracking-tight",
  "italiana-thin": "font-['Italiana',ui-serif,Georgia,serif] font-normal tracking-[0.08em]",
  "italiana-caps": "font-['Italiana',ui-serif,Georgia,serif] font-normal uppercase tracking-[0.12em]",
  "anton-caps": "font-['Anton',ui-sans-serif,system-ui,sans-serif] font-normal uppercase tracking-tight",
  "mono-caps": "font-mono font-bold uppercase tracking-[0.18em]",
  "bricolage-tight": "font-display font-extrabold tracking-tighter",
  "bricolage-wide": "font-display font-bold uppercase tracking-[0.18em]",
  "dm-thin-caps": "font-sans font-light uppercase tracking-[0.18em]",
  "dm-bold": "font-sans font-bold uppercase tracking-[0.05em]",
  "geist-bold": "font-display font-extrabold uppercase tracking-tight",
};

type QuickAddBrandProps = {
  brands: string[];
};

type TileState =
  | { kind: "idle" }
  | { kind: "open"; url: string }
  | { kind: "loading" }
  | { kind: "result"; analysis: AnalyzeResult; selectedSize: string | null };

export function QuickAddBrand({ brands }: QuickAddBrandProps) {
  const router = useRouter();
  const { locale } = useLocale();

  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [tile, setTile] = useState<TileState>({ kind: "idle" });
  const [submitting, setSubmitting] = useState(false);

  function open(brand: string) {
    setActiveBrand(brand);
    setTile({ kind: "open", url: "" });
  }

  function close() {
    setActiveBrand(null);
    setTile({ kind: "idle" });
  }

  async function handleAnalyze(url: string) {
    if (!url.trim()) return;
    setTile({ kind: "loading" });
    const res = await analyzeUrl(url.trim());
    if (!res.ok && res.error === "INVALID_URL") {
      toast.error(locale === "fr" ? "URL invalide" : "Invalid URL");
      setTile({ kind: "open", url });
      return;
    }
    setTile({ kind: "result", analysis: res, selectedSize: null });
  }

  async function handleCreate(analysis: AnalyzeResult, size: string | null) {
    setSubmitting(true);
    const res = await createWatch({
      url: analysis.url,
      name: analysis.name ?? null,
      image_url: analysis.image_url,
      price: analysis.price,
      variant_label: size,
      variant_id: size,
    });
    if (!res.ok) {
      if (res.error === "LIMIT_REACHED") {
        toast.error(
          locale === "fr"
            ? "Limite de plan atteinte. Passe à Pro."
            : "Plan limit reached. Upgrade to Pro.",
        );
        router.push("/upgrade");
        setSubmitting(false);
        return;
      }
      toast.error(
        locale === "fr"
          ? "Impossible de créer l'alerte"
          : "Could not create alert",
      );
      setSubmitting(false);
      return;
    }
    toast.success(
      locale === "fr" ? "Alerte activée !" : "Alert activated!",
    );
    close();
    router.refresh();
  }

  if (!brands.length) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {locale === "fr" ? "Ajout rapide par marque" : "Quick add by brand"}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {brands.map((brand) => {
          const s = BRAND_STYLES[brand];
          const isActive = activeBrand === brand;

          return (
            <div key={brand} className="relative">
              <button
                type="button"
                onClick={() => (isActive ? close() : open(brand))}
                className={cn(
                  "group flex h-16 w-full items-center justify-center rounded-xl border-2 transition-all",
                  isActive
                    ? "border-ink bg-ink text-cream shadow-brutal-sm"
                    : "border-border bg-card hover:border-ink/40 hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "truncate px-2 text-lg leading-none",
                    s ? STYLE_CLASSES[s.wordmark] : "font-display font-extrabold tracking-tight",
                    isActive && "text-cream",
                  )}
                  style={s?.accent && !isActive ? { color: `var(--brand-${s.accent})` } : undefined}
                >
                  {brand}
                </span>
                {!isActive && (
                  <Plus className="ml-1 h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                )}
                {isActive && (
                  <X className="ml-1.5 h-3.5 w-3.5 shrink-0 opacity-60" />
                )}
              </button>

              {/* Dropdown / inline input */}
              {isActive && (
                <div className="absolute left-0 top-full z-20 mt-2 w-full min-w-[260px] rounded-xl border-2 border-ink bg-paper p-3 shadow-brutal">
                  {tile.kind === "idle" && null}

                  {(tile.kind === "open" || tile.kind === "loading") && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          autoFocus
                          placeholder={s ? `https://${s.domain}/...` : "https://..."}
                          value={tile.kind === "open" ? tile.url : ""}
                          onChange={(e) =>
                            setTile({ kind: "open", url: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && tile.kind === "open") {
                              handleAnalyze(tile.url);
                            }
                          }}
                          disabled={tile.kind === "loading"}
                          className="h-10 flex-1 rounded-lg border-2 border-ink bg-paper px-3 text-sm font-medium shadow-brutal-sm placeholder:text-ink/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/40"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            tile.kind === "open" && handleAnalyze(tile.url)
                          }
                          disabled={
                            tile.kind === "loading" ||
                            (tile.kind === "open" && !tile.url.trim())
                          }
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-ink bg-ink text-cream shadow-brutal-sm hover-press disabled:opacity-40"
                        >
                          {tile.kind === "loading" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {tile.kind === "result" && (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        {tile.analysis.image_url && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={tile.analysis.image_url}
                            alt=""
                            className="h-16 w-16 shrink-0 rounded-lg border-2 border-ink object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold leading-tight">
                            {tile.analysis.name ?? brand}
                          </p>
                          {tile.analysis.price && (
                            <p className="text-xs font-medium text-muted-foreground">
                              {tile.analysis.price} €
                            </p>
                          )}
                          {tile.analysis.enrichment_pending && (
                            <p className="mt-1 text-[10px] text-amber-600">
                              {locale === "fr"
                                ? "Infos enrichies dans quelques minutes"
                                : "Details enriched in a few minutes"}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Size quick-select */}
                      {tile.analysis.sizes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {tile.analysis.sizes.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() =>
                                setTile({
                                  ...tile,
                                  selectedSize:
                                    tile.selectedSize === s ? null : s,
                                })
                              }
                              className={cn(
                                "rounded-full border px-2.5 py-1 text-xs font-bold transition-all",
                                tile.selectedSize === s
                                  ? "border-ink bg-ink text-cream"
                                  : "border-border hover:border-ink/40",
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleCreate(tile.analysis, tile.selectedSize)
                        }
                        disabled={submitting}
                        className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border-2 border-ink bg-[var(--brand-orange)] px-4 text-xs font-bold uppercase tracking-widest shadow-brutal-sm hover-press disabled:opacity-50"
                      >
                        {submitting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            {locale === "fr" ? "Activer l'alerte" : "Activate alert"}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
