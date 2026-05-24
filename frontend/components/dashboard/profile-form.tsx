"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  ExternalLink,
  Loader2,
  LogOut,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/components/site/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, type ProfileData } from "@/app/actions/profile";
import { ONBOARDING_BRANDS, EU_SIZES, LETTER_SIZES } from "@/components/auth/onboarding-steps";

type Props = {
  initial: ProfileData;
  email: string;
  plan: "free" | "pro";
};

export function ProfileForm({ initial, email, plan }: Props) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(initial.first_name ?? "");
  const [size, setSize] = useState<string | null>(initial.preferred_size ?? null);
  const [brands, setBrands] = useState<string[]>(initial.preferred_brands ?? []);

  const supabase = createClient();

  const sizes = [...EU_SIZES, ...LETTER_SIZES];

  function toggleBrand(b: string) {
    setBrands((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
    );
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
      setSaved(true);
      toast.success(locale === "fr" ? "Profil sauvegardé" : "Profile saved");
      setTimeout(() => setSaved(false), 2000);
    });
  }

  async function handleSignOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la déconnexion.");
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Page header */}
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {locale === "fr" ? "Paramètres" : "Settings"}
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          {locale === "fr" ? "Profil" : "Profile"}
        </h1>
      </div>

      {/* Email & plan card */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
            <User className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{email}</p>
            <p className="text-xs text-muted-foreground">
              {locale === "fr" ? "Email de connexion" : "Login email"}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold",
              plan === "pro"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-border bg-muted text-foreground/80",
            )}
          >
            {plan === "pro" ? (
              <>
                <Crown className="h-3 w-3" />
                Pro
              </>
            ) : (
              locale === "fr"
                ? "Gratuit"
                : "Free"
            )}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {plan === "free" ? (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.push("/upgrade")}>
              <Crown className="h-3.5 w-3.5" />
              {locale === "fr" ? "Passer à Pro" : "Upgrade to Pro"}
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.push("/upgrade")}>
              <ExternalLink className="h-3.5 w-3.5" />
              {locale === "fr" ? "Gérer l'abonnement" : "Manage subscription"}
            </Button>
          )}
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={handleSignOut}>
            <LogOut className="h-3.5 w-3.5" />
            {locale === "fr" ? "Se déconnecter" : "Sign out"}
          </Button>
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-6 rounded-2xl border bg-card p-5">
        {/* First name */}
        <div className="space-y-2">
          <Label htmlFor="profile-name">
            {locale === "fr" ? "Prénom" : "First name"}
          </Label>
          <Input
            id="profile-name"
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
            {ONBOARDING_BRANDS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => toggleBrand(b)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all active:scale-[0.97]",
                  brands.includes(b)
                    ? "border-foreground bg-foreground text-background shadow-sm"
                    : "border-border bg-background hover:border-foreground/40 hover:bg-muted",
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={isPending} size="lg" className="gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {isPending
              ? (locale === "fr" ? "Sauvegarde…" : "Saving…")
              : saved
                ? (locale === "fr" ? "Sauvegardé !" : "Saved!")
                : (locale === "fr" ? "Sauvegarder" : "Save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
