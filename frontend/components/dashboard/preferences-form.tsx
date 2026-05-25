"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/components/site/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { updateProfile, type ProfileData } from "@/app/actions/profile";
import { ONBOARDING_BRANDS, EU_SIZES, LETTER_SIZES } from "@/components/auth/onboarding-steps";

type Props = {
  initial: ProfileData;
};

export function PreferencesForm({ initial }: Props) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initial.first_name ?? "");
  const [size, setSize] = useState<string | null>(initial.preferred_size ?? null);
  const [brands, setBrands] = useState<string[]>(initial.preferred_brands ?? []);
  const [customBrand, setCustomBrand] = useState("");

  const sizes = [...EU_SIZES, ...LETTER_SIZES];

  function toggleBrand(b: string) {
    setBrands((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
    );
  }

  function addCustomBrand() {
    const v = customBrand.trim();
    if (!v || brands.includes(v)) return;
    setBrands((prev) => [...prev, v]);
    setCustomBrand("");
  }

  function removeBrand(b: string) {
    setBrands((prev) => prev.filter((x) => x !== b));
  }

  function handleSave() {
    startTransition(async () => {
      const res = await updateProfile({
        first_name: name.trim(),
        preferred_size: size,
        preferred_brands: brands,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Erreur lors de la sauvegarde.");
        return;
      }
      toast.success(locale === "fr" ? "Préférences sauvegardées" : "Preferences saved");
      router.push("/dashboard");
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {locale === "fr" ? "Personnalisation" : "Personalization"}
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          {t.profile.preferencesTitle}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.profile.preferencesSub}
        </p>
      </div>

      <div className="space-y-6 rounded-2xl border bg-card p-5">
        {/* First name */}
        <div className="space-y-2">
          <Label htmlFor="pref-name">
            {locale === "fr" ? "Prénom" : "First name"}
          </Label>
          <Input
            id="pref-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={locale === "fr" ? "Ton prénom" : "Your first name"}
          />
        </div>

        {/* Size */}
        <div className="space-y-2">
          <Label>
            {locale === "fr" ? "Taille habituelle" : "Usual size"}
          </Label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(size === s ? null : s)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all active:scale-[0.97]",
                  size === s
                    ? "border-foreground bg-foreground text-background shadow-sm"
                    : "border-border bg-background hover:border-foreground/40 hover:bg-muted",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div className="space-y-2">
          <Label>
            {locale === "fr" ? "Marques suivies" : "Followed brands"}
          </Label>
          <div className="flex flex-wrap gap-2">
            {brands.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => removeBrand(b)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all active:scale-[0.97] inline-flex items-center gap-1",
                  "border-foreground bg-foreground text-background shadow-sm",
                )}
              >
                {b}
                <X className="h-3 w-3 opacity-60" />
              </button>
            ))}
            {ONBOARDING_BRANDS.filter((b) => !brands.includes(b)).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => toggleBrand(b)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all active:scale-[0.97]",
                  "border-border bg-background hover:border-foreground/40 hover:bg-muted",
                )}
              >
                {b}
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <Input
              type="text"
              value={customBrand}
              onChange={(e) => setCustomBrand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomBrand();
                }
              }}
              placeholder={locale === "fr" ? "Autre marque…" : "Other brand…"}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addCustomBrand}
              disabled={!customBrand.trim()}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={isPending} size="lg" className="w-full gap-2 sm:w-auto">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {isPending ? t.profile.saving : t.profile.saveButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
