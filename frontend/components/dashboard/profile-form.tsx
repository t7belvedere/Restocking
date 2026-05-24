"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  Loader2,
  LogOut,
  Mail,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/components/site/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, deleteAccount, changeEmail, changePassword, type ProfileData } from "@/app/actions/profile";
import { sendPhoneOtp, verifyPhoneOtp } from "@/app/actions/phone-verification";
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
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState(initial.first_name ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [phoneVerified, setPhoneVerified] = useState(
    Boolean((initial as any).phone_verified),
  );
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [size, setSize] = useState<string | null>(initial.preferred_size ?? null);
  const [brands, setBrands] = useState<string[]>(initial.preferred_brands ?? []);

  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const supabase = createClient();

  const sizes = [...EU_SIZES, ...LETTER_SIZES];

  function toggleBrand(b: string) {
    setBrands((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
    );
  }

  async function handleSendOtp() {
    if (!phone.trim()) {
      toast.error(
        locale === "fr"
          ? "Entre d'abord ton numéro de téléphone."
          : "Enter your phone number first.",
      );
      return;
    }
    setSendingOtp(true);
    const res = await sendPhoneOtp(phone.trim());
    setSendingOtp(false);
    if (res.ok) {
      setShowOtpInput(true);
      toast.success(
        locale === "fr"
          ? "Code envoyé par SMS. Vérifie ton téléphone."
          : "Code sent via SMS. Check your phone.",
      );
    } else {
      toast.error(res.error ?? "Erreur");
    }
  }

  async function handleVerifyOtp() {
    if (otpCode.length !== 6) return;
    setVerifyingOtp(true);
    const res = await verifyPhoneOtp(phone.trim(), otpCode);
    setVerifyingOtp(false);
    if (res.ok) {
      setPhoneVerified(true);
      setShowOtpInput(false);
      setOtpCode("");
      // Save phone_verified in user metadata
      await updateProfile({ phone: phone.trim(), phone_verified: true });
      toast.success(
        locale === "fr" ? "Téléphone vérifié !" : "Phone verified!",
      );
    } else {
      toast.error(res.error ?? "Code incorrect");
    }
  }

  function handleSave() {
    startTransition(async () => {
      const res = await updateProfile({
        first_name: name.trim(),
        phone: phone.trim() || undefined,
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

  async function handleChangeEmail() {
    if (!newEmail.trim() || !newEmail.includes("@")) return;
    setChangingEmail(true);
    const res = await changeEmail(newEmail.trim());
    setChangingEmail(false);
    if (res.ok) {
      setNewEmail("");
      toast.success(t.profile.changeEmailSuccess);
    } else {
      toast.error(res.error ?? "Erreur");
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 8) {
      toast.error(t.profile.passwordTooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t.profile.passwordMismatch);
      return;
    }
    setChangingPassword(true);
    const res = await changePassword(currentPassword, newPassword);
    setChangingPassword(false);
    if (res.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(t.profile.changePasswordSuccess);
    } else {
      toast.error(res.error ?? "Erreur");
    }
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

  async function handleDelete() {
    setDeleting(true);
    const res = await deleteAccount();
    if (!res.ok) {
      toast.error(res.error ?? "Erreur lors de la suppression.");
      setDeleting(false);
      return;
    }
    // Sign out locally then redirect to home
    await supabase?.auth.signOut();
    router.replace("/");
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

      {/* Account card */}
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
            ) : locale === "fr" ? "Gratuit" : "Free"}
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

      {/* Change email */}
      <div className="space-y-4 rounded-2xl border bg-card p-5">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            {t.profile.changeEmailTitle}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {t.profile.changeEmailDesc}
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="nouveau@exemple.fr"
            className="flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleChangeEmail}
            disabled={changingEmail || !newEmail.trim() || !newEmail.includes("@")}
            className="shrink-0 gap-1.5"
          >
            {changingEmail ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : null}
            {changingEmail ? t.profile.changeEmailPending : t.profile.changeEmailButton}
          </Button>
        </div>
      </div>

      {/* Change password */}
      <div className="space-y-4 rounded-2xl border bg-card p-5">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight flex items-center gap-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            {t.profile.changePasswordTitle}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {t.profile.changePasswordDesc}
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">{t.profile.currentPasswordLabel}</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPw ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">{t.profile.newPasswordLabel}</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">{t.profile.confirmPasswordLabel}</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleChangePassword}
          disabled={changingPassword || !currentPassword || newPassword.length < 8 || !confirmPassword}
          className="gap-1.5"
        >
          {changingPassword ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : null}
          {changingPassword ? t.profile.changePasswordPending : t.profile.changePasswordButton}
        </Button>
      </div>

      {/* Notifications */}
      <div className="space-y-6 rounded-2xl border bg-card p-5">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {locale === "fr" ? "Notifications" : "Notifications"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {locale === "fr"
              ? "On te prévient par email (tous les plans) et par SMS (Pro uniquement)."
              : "We notify you by email (all plans) and SMS (Pro only)."}
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label>
            {locale === "fr" ? "Email" : "Email"}
          </Label>
          <Input
            value={email}
            disabled
            className="bg-muted/50"
          />
          <p className="text-xs text-muted-foreground">
            <CheckCircle2 className="mr-1 inline h-3 w-3 text-emerald-600" />
            {locale === "fr"
              ? "Les alertes restock sont envoyées à cette adresse."
              : "Restock alerts are sent to this address."}
          </p>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="profile-phone">
            {locale === "fr" ? "Téléphone (SMS)" : "Phone (SMS)"}
          </Label>
          <div className="flex gap-2">
            <Input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneVerified(false);
              }}
              placeholder="+33 6 12 34 56 78"
              disabled={plan !== "pro"}
              className="flex-1"
            />
            {plan === "pro" && phone.trim() ? (
              <Button
                type="button"
                variant={phoneVerified ? "outline" : "default"}
                size="sm"
                onClick={phoneVerified ? undefined : handleSendOtp}
                disabled={sendingOtp || phoneVerified}
                className="shrink-0 gap-1.5"
              >
                {sendingOtp ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : phoneVerified ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : null}
                {phoneVerified
                  ? (locale === "fr" ? "Vérifié" : "Verified")
                  : (locale === "fr" ? "Vérifier" : "Verify")}
              </Button>
            ) : null}
          </div>

          {showOtpInput ? (
            <div className="flex gap-2 pt-1">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-28 text-center font-mono tracking-[0.5em]"
              />
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || otpCode.length !== 6}
                className="gap-1.5"
              >
                {verifyingOtp ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                {locale === "fr" ? "Valider" : "Confirm"}
              </Button>
            </div>
          ) : null}

          {plan !== "pro" ? (
            <p className="text-xs text-muted-foreground">
              <Crown className="mr-1 inline h-3 w-3 text-amber-500" />
              {locale === "fr"
                ? "Les SMS sont réservés au plan Pro."
                : "SMS notifications are for Pro plan only."}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {phoneVerified
                ? (locale === "fr"
                    ? "Téléphone vérifié. On t'envoie un SMS dès qu'un produit revient."
                    : "Phone verified. We'll text you when a product restocks.")
                : (locale === "fr"
                    ? "Clique sur Vérifier pour recevoir un code par SMS."
                    : "Click Verify to receive a code via SMS.")}
            </p>
          )}
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={isPending} size="lg" className="w-full gap-2 sm:w-auto">
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

      {/* Preferences */}
      <div className="space-y-6 rounded-2xl border bg-card p-5">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {locale === "fr" ? "Préférences" : "Preferences"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {locale === "fr"
              ? "Tes marques et ta taille habituelle nous aident à mieux te servir."
              : "Your brands and usual size help us serve you better."}
          </p>
        </div>

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
          <Button onClick={handleSave} disabled={isPending} size="lg" className="w-full gap-2 sm:w-auto">
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

      {/* Danger zone */}
      <div className="rounded-2xl border-2 border-[oklch(0.55_0.22_27)]/40 bg-[oklch(0.97_0.04_27)]/30 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[oklch(0.4_0.2_27)]">
              {locale === "fr" ? "Zone dangereuse" : "Danger zone"}
            </p>
            <p className="mt-0.5 text-xs text-[oklch(0.45_0.18_27)]/80">
              {locale === "fr"
                ? "Supprimer définitivement ton compte et toutes tes données. Cette action est irréversible."
                : "Permanently delete your account and all data. This cannot be undone."}
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5 border-[oklch(0.55_0.22_27)]/60 text-[oklch(0.45_0.2_27)] hover:bg-[oklch(0.55_0.22_27)]/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {locale === "fr" ? "Supprimer mon compte" : "Delete my account"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {locale === "fr"
                    ? "Supprimer ton compte ?"
                    : "Delete your account?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {locale === "fr"
                    ? "Toutes tes alertes, ton historique et tes données seront définitivement effacés. Tu ne pourras pas revenir en arrière."
                    : "All your alerts, history, and data will be permanently erased. This cannot be undone."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {locale === "fr" ? "Annuler" : "Cancel"}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-[oklch(0.55_0.22_27)] text-white hover:bg-[oklch(0.48_0.2_27)]"
                >
                  {deleting
                    ? (locale === "fr" ? "Suppression…" : "Deleting…")
                    : (locale === "fr" ? "Supprimer définitivement" : "Delete forever")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
