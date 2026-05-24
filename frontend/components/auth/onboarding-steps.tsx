"use client";

import { useState } from "react";
import {
  ArrowRight,
  Loader2,
  Trophy,
} from "lucide-react";
import { useLocale } from "@/components/site/locale-provider";
import { type SignupState } from "@/app/(auth)/signup/actions";
import { signInWithGoogleAction } from "@/app/(auth)/login/oauth-actions";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

export type OnboardingAnswers = {
  preferred_brands: string[];
  preferred_size: string | null;
  first_name: string;
  missed_product_url: string | null;
};

export const EMPTY_ANSWERS: OnboardingAnswers = {
  preferred_brands: [],
  preferred_size: null,
  first_name: "",
  missed_product_url: null,
};

export const ONBOARDING_BRANDS = [
  "ZARA",
  "COS",
  "ARITZIA",
  "Sézane",
  "UNIQLO",
  "MANGO",
  "ARKET",
  "GANNI",
  "Massimo Dutti",
  "& Other Stories",
  "Weekday",
  "Monki",
  "BERSHKA",
  "Pull&Bear",
  "Stradivarius",
  "ASOS",
];

export const EU_SIZES = ["34", "36", "38", "40", "42", "44", "46"];

export const LETTER_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

// ---------------------------------------------------------------------------
// Shared: pill style helper
// ---------------------------------------------------------------------------

function pillClass(selected: boolean) {
  return cn(
    "rounded-full border-2 px-4 py-2 font-display text-sm font-bold uppercase tracking-widest transition-colors cursor-pointer select-none",
    selected
      ? "border-ink bg-ink text-cream shadow-brutal-sm"
      : "border-ink/30 bg-paper text-ink/60 hover:border-ink/60",
  );
}

// ---------------------------------------------------------------------------
// BrandStep
// ---------------------------------------------------------------------------

export function BrandStep({
  answers,
  setAnswers,
}: {
  answers: OnboardingAnswers;
  setAnswers: (a: OnboardingAnswers) => void;
}) {
  const { t, locale } = useLocale();
  const [custom, setCustom] = useState("");

  const toggle = (brand: string) => {
    const exists = answers.preferred_brands.includes(brand);
    setAnswers({
      ...answers,
      preferred_brands: exists
        ? answers.preferred_brands.filter((b) => b !== brand)
        : [...answers.preferred_brands, brand],
    });
  };

  function addCustom() {
    const v = custom.trim();
    if (!v) return;
    if (!answers.preferred_brands.includes(v)) {
      setAnswers({
        ...answers,
        preferred_brands: [...answers.preferred_brands, v],
      });
    }
    setCustom("");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {ONBOARDING_BRANDS.map((brand) => (
          <button
            key={brand}
            type="button"
            onClick={() => toggle(brand)}
            className={pillClass(answers.preferred_brands.includes(brand))}
          >
            {brand}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={locale === "fr" ? "Autre marque…" : "Other brand…"}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          className="h-12 flex-1 rounded-full border-2 border-dashed border-ink/30 bg-paper px-4 text-base font-medium text-ink placeholder:text-ink/40 focus-visible:outline-none focus-visible:border-ink/60 sm:text-sm"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!custom.trim()}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-ink/30 bg-paper text-ink/50 hover:border-ink/60 hover:text-ink disabled:opacity-30 transition-colors"
          aria-label={locale === "fr" ? "Ajouter" : "Add"}
        >
          +
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SizeStep
// ---------------------------------------------------------------------------

export function SizeStep({
  answers,
  setAnswers,
}: {
  answers: OnboardingAnswers;
  setAnswers: (a: OnboardingAnswers) => void;
}) {
  const select = (size: string) => {
    setAnswers({
      ...answers,
      preferred_size: answers.preferred_size === size ? null : size,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {EU_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => select(size)}
            className={pillClass(answers.preferred_size === size)}
          >
            {size}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {LETTER_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => select(size)}
            className={pillClass(answers.preferred_size === size)}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NameStep
// ---------------------------------------------------------------------------

export function NameStep({
  answers,
  setAnswers,
}: {
  answers: OnboardingAnswers;
  setAnswers: (a: OnboardingAnswers) => void;
}) {
  const { t } = useLocale();

  return (
    <input
      type="text"
      autoFocus
      autoComplete="given-name"
      placeholder={t.auth.onboarding.namePlaceholder}
      value={answers.first_name}
      onChange={(e) =>
        setAnswers({ ...answers, first_name: e.target.value })
      }
      className="h-14 w-full rounded-xl border-2 border-ink bg-paper px-4 font-medium text-ink shadow-brutal-sm placeholder:text-ink/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/40"
    />
  );
}

// ---------------------------------------------------------------------------
// ProductStep
// ---------------------------------------------------------------------------

export function ProductStep({
  answers,
  setAnswers,
  busy,
}: {
  answers: OnboardingAnswers;
  setAnswers: (a: OnboardingAnswers) => void;
  busy?: boolean;
}) {
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);

  const handleBlur = () => {
    const url = answers.missed_product_url?.trim();
    if (!url) {
      setError(null);
      return;
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        setError(null);
      } else {
        setError(t.auth.onboarding.productInvalidUrl);
      }
    } catch {
      setError(t.auth.onboarding.productInvalidUrl);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="url"
        autoFocus
        autoComplete="url"
        placeholder={t.auth.onboarding.productPlaceholder}
        value={answers.missed_product_url ?? ""}
        disabled={busy}
        onChange={(e) =>
          setAnswers({ ...answers, missed_product_url: e.target.value })
        }
        onBlur={handleBlur}
        className={cn(
          "h-14 w-full rounded-xl border-2 bg-paper px-4 font-medium text-ink shadow-brutal-sm",
          "placeholder:text-ink/40",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/40",
          error ? "border-[oklch(0.55_0.22_27)]" : "border-ink",
        )}
      />
      {error && (
        <p className="text-xs font-medium text-[oklch(0.55_0.22_27)]">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PasswordField (internal, with custom brutalist eye toggle)
// ---------------------------------------------------------------------------

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  ariaInvalid,
  disabled,
  error,
  hint,
  locale,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete?: string;
  ariaInvalid?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  locale: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block font-display text-xs font-bold uppercase tracking-[0.2em] text-ink"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={8}
          required
          aria-invalid={ariaInvalid}
          disabled={disabled}
          className={cn(
            "h-12 w-full rounded-xl border-2 border-ink bg-paper pr-14 pl-4 font-medium text-ink shadow-brutal-sm",
            "placeholder:text-ink/40",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/40",
            error && "border-[oklch(0.55_0.22_27)]",
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? (locale === "fr" ? "Masquer" : "Hide") : (locale === "fr" ? "Afficher" : "Show")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-lg text-ink/40 hover:text-ink transition-colors"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden>
            <path
              d="M1 7c1.6-3.6 4.8-6 8-6s6.4 2.4 8 6-4.8 6-8 6-6.4-2.4-8-6Z"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="9" cy="7" r="2"
              fill="currentColor"
              className={visible ? "text-[var(--brand-orange)]" : ""}
            />
            {visible && (
              <line x1="1" y1="1" x2="17" y2="13" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>
      {error ? (
        <p className="text-xs font-medium text-[oklch(0.55_0.22_27)]">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink/55">{hint}</p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// GoogleIcon
// ---------------------------------------------------------------------------

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SignupStep
// ---------------------------------------------------------------------------

export type Locale = "fr" | "en";

export function SignupStep({
  answers,
  setAnswers: _setAnswers,
  locale,
  isPending,
  state,
  confirmError,
  onGoogleSignIn,
  onEmailSignUp,
}: {
  answers: OnboardingAnswers;
  setAnswers?: (a: OnboardingAnswers) => void;
  locale: Locale;
  isPending: boolean;
  state: SignupState;
  confirmError?: string | null;
  onGoogleSignIn: () => void;
  onEmailSignUp: (formData: FormData) => void;
}) {
  const { t } = useLocale();

  return (
    <div className="space-y-5">
      {/* Google sign-in */}
      <form action={signInWithGoogleAction} onSubmit={onGoogleSignIn}>
        <input type="hidden" name="locale" value={locale} />
        <button
          type="submit"
          className="group inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border-2 border-ink bg-paper px-4 font-display text-sm font-bold uppercase tracking-widest text-ink shadow-brutal hover-press"
        >
          <GoogleIcon className="h-5 w-5" />
          {t.auth.continueGoogle}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-ink/20" />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
          {t.auth.orContinue}
        </span>
        <span className="h-px flex-1 bg-ink/20" />
      </div>

      {/* Email/password form */}
      <form action={onEmailSignUp} className="space-y-4" noValidate>
        <input type="hidden" name="locale" value={locale} />

        <div className="space-y-1.5">
          <label
            htmlFor="onboarding-signup-email"
            className="block font-display text-xs font-bold uppercase tracking-[0.2em] text-ink"
          >
            {t.auth.email}
          </label>
          <input
            id="onboarding-signup-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
            placeholder={t.auth.emailPlaceholder}
            disabled={isPending}
            className={cn(
              "h-12 w-full rounded-xl border-2 border-ink bg-paper px-4 font-medium text-ink shadow-brutal-sm",
              "placeholder:text-ink/40",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/40",
              state.fieldErrors?.email && "border-[oklch(0.55_0.22_27)]",
            )}
          />
          {state.fieldErrors?.email ? (
            <p className="text-xs font-medium text-[oklch(0.55_0.22_27)]">
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>

        <PasswordField
          id="onboarding-signup-password"
          name="password"
          label={t.auth.password}
          autoComplete="new-password"
          ariaInvalid={Boolean(state.fieldErrors?.password)}
          disabled={isPending}
          error={state.fieldErrors?.password}
          hint={t.auth.passwordHint}
          locale={locale}
        />

        <PasswordField
          id="onboarding-signup-confirm"
          name="confirm_password"
          label={locale === "fr" ? "Confirme le mot de passe" : "Confirm password"}
          autoComplete="new-password"
          disabled={isPending}
          locale={locale}
          error={confirmError ?? undefined}
        />

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-ink",
            "bg-[var(--brand-orange)] font-display text-sm font-bold uppercase tracking-widest text-ink shadow-brutal hover-press",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {t.auth.signUpSubmit}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        {state.status === "error" && state.formError ? (
          <div className="rounded-xl border-2 border-[oklch(0.55_0.22_27)] bg-[oklch(0.97_0.04_27)] p-3">
            <p className="text-sm font-medium text-[oklch(0.4_0.2_27)]">
              {state.formError}
            </p>
          </div>
        ) : null}

        <p className="text-center text-xs text-ink/55">{t.auth.legalBlurb}</p>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SuccessStep
// ---------------------------------------------------------------------------

export function SuccessStep({
  onGoToAdd,
}: {
  onGoToAdd: () => void;
}) {
  const { t } = useLocale();

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <Trophy className="h-16 w-16 text-[var(--brand-orange)]" strokeWidth={1.5} />
      <div className="space-y-2">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink">
          {t.auth.onboarding.successTitle}
        </h2>
        <p className="text-sm text-ink/70 max-w-sm">
          {t.auth.onboarding.successBody}
        </p>
      </div>
      <button
        type="button"
        onClick={onGoToAdd}
        className={cn(
          "inline-flex h-12 items-center gap-2 rounded-xl border-2 border-ink",
          "bg-[var(--brand-orange)] px-6 font-display text-sm font-bold uppercase tracking-widest text-ink shadow-brutal hover-press",
        )}
      >
        {t.auth.onboarding.successCta}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
