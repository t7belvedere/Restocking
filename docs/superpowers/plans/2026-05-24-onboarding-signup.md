# Onboarding Signup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the signup page into a conversational 6-step onboarding flow (brands → size → name → optional product URL → signup → success).

**Architecture:** Client-side `OnboardingFlow` component manages step state and localStorage persistence. Steps 1-4 collect preferences client-side. Step 5 performs the actual Supabase signup (Google OAuth or email/password) and persists onboarding answers to `user_metadata`. The OAuth callback reads a short-lived cookie to survive the redirect. Step 6 shows success and redirects.

**Tech Stack:** Next.js 15 App Router, React Server Components + Client Components, Supabase Auth, shadcn/ui, CSS classes from globals.css (neo-brutalist)

---

### Task 1: Add i18n messages for onboarding

**Files:**
- Modify: `frontend/lib/i18n/messages.ts`

- [ ] **Step 1: Add onboarding strings to both fr and en messages**

Add under `auth.onboarding` in both locales. In the `fr` block, after `auth.legalBlurb`:

```ts
onboarding: {
  stepLabel: (current: number, total: number) => `Étape ${current}/${total}`,
  brandsTitle: "Tu suis quelles marques ?",
  brandsSub: "On surveillera leurs restocks pour toi",
  brandsContinue: "Continuer",
  sizeTitle: "Ta taille habituelle ?",
  sizeSub: "On pré-remplira tes futures alertes avec",
  sizeContinue: "Continuer",
  nameTitle: "On t'appelle comment ?",
  nameSub: "Pour personnaliser tes alertes",
  namePlaceholder: "Ton prénom",
  nameContinue: "Presque fini",
  productTitle: "Un produit en tête ?",
  productSub: "Colle le lien du produit qui t'a échappé, on crée ta première alerte direct",
  productPlaceholder: "https://www.zara.com/...",
  productSkip: "Plutôt passer",
  productInvalidUrl: "URL invalide. Vérifie le lien.",
  productCta: "Créer l'alerte",
  signupTitle: "On enregistre tout ça",
  signupSub: "Pour ne pas perdre ta sélection",
  successTitle: "Tout est prêt !",
  successBody: "Vérifie ta boîte mail pour confirmer. Ta première alerte t'attend.",
  successCta: "Ajouter ma première alerte",
},
```

In the `en` block, same structure:

```ts
onboarding: {
  stepLabel: (current: number, total: number) => `Step ${current}/${total}`,
  brandsTitle: "Which brands do you follow?",
  brandsSub: "We'll watch their restocks for you",
  brandsContinue: "Continue",
  sizeTitle: "Your usual size?",
  sizeSub: "We'll pre-fill your future alerts with it",
  sizeContinue: "Continue",
  nameTitle: "What should we call you?",
  nameSub: "To personalise your alerts",
  namePlaceholder: "Your first name",
  nameContinue: "Almost done",
  productTitle: "Got a product in mind?",
  productSub: "Paste the link of the item you missed — we'll create your first alert",
  productPlaceholder: "https://www.zara.com/...",
  productSkip: "Skip for now",
  productInvalidUrl: "Invalid URL. Check the link.",
  productCta: "Create alert",
  signupTitle: "Let's save this",
  signupSub: "So you don't lose your preferences",
  successTitle: "All set!",
  successBody: "Check your inbox to confirm. Your first alert is waiting.",
  successCta: "Add my first alert",
},
```

- [ ] **Step 2: Verify types**

Run: `cd frontend && npx tsc --noEmit 2>&1 | head -20`
Expected: no new errors related to i18n.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/i18n/messages.ts
git commit -m "feat: add onboarding i18n strings for fr and en"
```

---

### Task 2: Create onboarding step components

**Files:**
- Create: `frontend/components/auth/onboarding-steps.tsx`

- [ ] **Step 1: Create the file with all step components and data constants**

```tsx
"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useLocale } from "@/components/site/locale-provider";
import { cn } from "@/lib/utils";
import { RETAILERS } from "@/lib/data/retailers";

// ── Data ──────────────────────────────────────────────────────────────

const ONBOARDING_BRANDS = [
  "ZARA", "COS", "ARITZIA", "Sézane", "UNIQLO", "MANGO", "ARKET",
  "GANNI", "Massimo Dutti", "& Other Stories", "Weekday", "Monki",
  "BERSHKA", "Pull&Bear", "Stradivarius", "ASOS",
];

const EU_SIZES = ["34", "36", "38", "40", "42", "44", "46"];
const LETTER_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

// ── Shared props ──────────────────────────────────────────────────────

type StepProps = {
  answers: OnboardingAnswers;
  setAnswers: (a: OnboardingAnswers) => void;
  busy?: boolean;
};

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

// ── BrandStep ─────────────────────────────────────────────────────────

export function BrandStep({ answers, setAnswers }: StepProps) {
  const { t } = useLocale();
  const toggle = (b: string) => {
    const next = answers.preferred_brands.includes(b)
      ? answers.preferred_brands.filter((x) => x !== b)
      : [...answers.preferred_brands, b];
    setAnswers({ ...answers, preferred_brands: next });
  };

  return (
    <div className="space-y-5">
      <p className="text-xs font-medium text-muted-foreground">
        {t.auth.onboarding.brandsSub}
      </p>
      <div className="flex flex-wrap gap-2">
        {ONBOARDING_BRANDS.map((b) => {
          const active = answers.preferred_brands.includes(b);
          return (
            <button
              key={b}
              type="button"
              onClick={() => toggle(b)}
              className={cn(
                "rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition-all active:scale-[0.97]",
                active
                  ? "border-ink bg-ink text-cream shadow-brutal-sm"
                  : "border-ink/30 bg-paper text-ink/60 hover:border-ink/60",
              )}
            >
              {b}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── SizeStep ───────────────────────────────────────────────────────────

export function SizeStep({ answers, setAnswers }: StepProps) {
  const { t } = useLocale();
  const select = (s: string) =>
    setAnswers({ ...answers, preferred_size: answers.preferred_size === s ? null : s });

  return (
    <div className="space-y-5">
      <p className="text-xs font-medium text-muted-foreground">
        {t.auth.onboarding.sizeSub}
      </p>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {EU_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => select(s)}
              className={cn(
                "rounded-full border-2 px-4 py-2 text-sm font-bold transition-all active:scale-[0.97]",
                answers.preferred_size === s
                  ? "border-ink bg-ink text-cream shadow-brutal-sm"
                  : "border-ink/30 bg-paper text-ink/60 hover:border-ink/60",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {LETTER_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => select(s)}
              className={cn(
                "rounded-full border-2 px-4 py-2 text-sm font-bold transition-all active:scale-[0.97]",
                answers.preferred_size === s
                  ? "border-ink bg-ink text-cream shadow-brutal-sm"
                  : "border-ink/30 bg-paper text-ink/60 hover:border-ink/60",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── NameStep ──────────────────────────────────────────────────────────

export function NameStep({ answers, setAnswers }: StepProps) {
  const { t } = useLocale();
  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-muted-foreground">
        {t.auth.onboarding.nameSub}
      </p>
      <input
        type="text"
        autoFocus
        autoComplete="given-name"
        placeholder={t.auth.onboarding.namePlaceholder}
        value={answers.first_name}
        onChange={(e) => setAnswers({ ...answers, first_name: e.target.value })}
        className="h-14 w-full rounded-xl border-2 border-ink bg-paper px-5 text-lg font-medium text-ink shadow-brutal-sm placeholder:text-ink/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/40"
      />
    </div>
  );
}

// ── ProductStep ───────────────────────────────────────────────────────

export function ProductStep({ answers, setAnswers, busy }: StepProps) {
  const { t } = useLocale();
  const [error, setError] = useState("");
  const hasUrl = Boolean(answers.missed_product_url?.trim());

  function validate(url: string) {
    if (!url.trim()) return true;
    try {
      const u = new URL(url.trim());
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-muted-foreground">
        {t.auth.onboarding.productSub}
      </p>
      <input
        type="url"
        inputMode="url"
        autoFocus
        placeholder={t.auth.onboarding.productPlaceholder}
        value={answers.missed_product_url ?? ""}
        onChange={(e) => {
          setAnswers({ ...answers, missed_product_url: e.target.value });
          setError("");
        }}
        onBlur={(e) => {
          if (e.target.value.trim() && !validate(e.target.value)) {
            setError(t.auth.onboarding.productInvalidUrl);
          }
        }}
        className={cn(
          "h-14 w-full rounded-xl border-2 bg-paper px-5 text-sm font-medium shadow-brutal-sm placeholder:text-ink/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/40",
          error ? "border-[oklch(0.55_0.22_27)]" : "border-ink",
        )}
      />
      {error && (
        <p className="text-xs font-medium text-[oklch(0.55_0.22_27)]">{error}</p>
      )}
    </div>
  );
}

// ── SignupStep ─────────────────────────────────────────────────────────

type SignupStepProps = StepProps & {
  locale: string;
  isPending: boolean;
  state: import("@/app/(auth)/signup/actions").SignupState;
  onGoogleSignIn: () => void;
  onEmailSignUp: (form: FormData) => void;
};

export function SignupStep({
  answers,
  setAnswers,
  locale,
  isPending,
  state,
  onGoogleSignIn,
  onEmailSignUp,
}: SignupStepProps) {
  const { t } = useLocale();

  if (state.status === "success" && state.email) {
    return (
      <div className="rounded-2xl border-2 border-ink bg-[var(--brand-lime)] p-6 shadow-brutal">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-paper">
            <Mail className="h-5 w-5 text-ink" />
          </span>
          <div>
            <h3 className="font-display text-2xl font-extrabold tracking-tight text-ink">
              {t.auth.checkEmailTitle}
            </h3>
            <p className="mt-2 text-sm text-ink/85">
              {t.auth.checkEmailBody}{" "}
              <strong className="font-bold">{state.email}</strong>.
            </p>
            <p className="mt-2 text-xs text-ink/65">{t.auth.checkEmailHint}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-xs font-medium text-muted-foreground">
        {t.auth.onboarding.signupSub}
      </p>

      <form action={() => onGoogleSignIn()} data-testid="signup-google-form">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="onboarding" value={JSON.stringify(answers)} />
        <button
          type="submit"
          className="group inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border-2 border-ink bg-paper px-4 font-display text-sm font-bold uppercase tracking-widest text-ink shadow-brutal hover-press"
        >
          <GoogleIcon className="h-5 w-5" />
          {t.auth.continueGoogle}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-ink/20" />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
          {t.auth.orContinue}
        </span>
        <span className="h-px flex-1 bg-ink/20" />
      </div>

      <form action={onEmailSignUp} className="space-y-4" data-testid="signup-form" noValidate>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="onboarding" value={JSON.stringify(answers)} />

        <div className="space-y-1.5">
          <label htmlFor="signup-email" className="block font-display text-xs font-bold uppercase tracking-[0.2em] text-ink">
            {t.auth.email}
          </label>
          <input
            id="signup-email"
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
          {state.fieldErrors?.email && (
            <p className="text-xs font-medium text-[oklch(0.55_0.22_27)]">{state.fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="signup-password" className="block font-display text-xs font-bold uppercase tracking-[0.2em] text-ink">
            {t.auth.password}
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            aria-invalid={Boolean(state.fieldErrors?.password)}
            disabled={isPending}
            className={cn(
              "h-12 w-full rounded-xl border-2 border-ink bg-paper px-4 font-medium text-ink shadow-brutal-sm",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/40",
              state.fieldErrors?.password && "border-[oklch(0.55_0.22_27)]",
            )}
          />
          {state.fieldErrors?.password && (
            <p className="text-xs font-medium text-[oklch(0.55_0.22_27)]">{state.fieldErrors.password}</p>
          )}
          {!state.fieldErrors?.password && (
            <p className="text-xs text-ink/55">{t.auth.passwordHint}</p>
          )}
        </div>

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

        {state.status === "error" && state.formError && (
          <div className="rounded-xl border-2 border-[oklch(0.55_0.22_27)] bg-[oklch(0.97_0.04_27)] p-3">
            <p className="text-sm font-medium text-[oklch(0.4_0.2_27)]">{state.formError}</p>
          </div>
        )}

        <p className="text-center text-xs text-ink/55">{t.auth.legalBlurb}</p>
      </form>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ── SuccessStep ────────────────────────────────────────────────────────

export function SuccessStep({ onGoToAdd }: { onGoToAdd: () => void }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-5xl">🏆</span>
      <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink">
        {t.auth.onboarding.successTitle}
      </h3>
      <p className="mt-3 max-w-xs text-sm text-ink/65">
        {t.auth.onboarding.successBody}
      </p>
      <button
        type="button"
        onClick={onGoToAdd}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-ink bg-[var(--brand-orange)] px-6 font-display text-sm font-bold uppercase tracking-widest text-ink shadow-brutal hover-press"
      >
        {t.auth.onboarding.successCta}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `cd frontend && npx tsc --noEmit 2>&1 | head -20`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/auth/onboarding-steps.tsx
git commit -m "feat: add onboarding step components (brands, size, name, product, signup, success)"
```

---

### Task 3: Create OnboardingFlow orchestrator

**Files:**
- Create: `frontend/components/auth/onboarding-flow.tsx`

- [ ] **Step 1: Create the orchestrator component**

```tsx
"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/components/site/locale-provider";
import { signupAction, type SignupState } from "@/app/(auth)/signup/actions";
import { signInWithGoogleAction } from "@/app/(auth)/login/oauth-actions";
import { cn } from "@/lib/utils";
import {
  BrandStep,
  SizeStep,
  NameStep,
  ProductStep,
  SignupStep,
  SuccessStep,
  EMPTY_ANSWERS,
  type OnboardingAnswers,
} from "./onboarding-steps";

const TOTAL_STEPS = 5; // brands, size, name, product, signup
const STORAGE_KEY = "restocking_onboarding";

function loadAnswers(): OnboardingAnswers {
  if (typeof window === "undefined") return { ...EMPTY_ANSWERS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...EMPTY_ANSWERS, ...parsed };
    }
  } catch { /* ignore */ }
  return { ...EMPTY_ANSWERS };
}

function saveAnswers(a: OnboardingAnswers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
  } catch { /* ignore */ }
}

function clearAnswers() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

export function OnboardingFlow() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [step, setStep] = useState(1);
  const [answers, setAnswersState] = useState<OnboardingAnswers>(loadAnswers);
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(signupAction, { status: "idle" } as SignupState);

  const setAnswers = useCallback((a: OnboardingAnswers) => {
    setAnswersState(a);
    saveAnswers(a);
  }, []);

  // Clean up on unmount if we're past signup
  useEffect(() => {
    if (step === TOTAL_STEPS + 1) {
      clearAnswers();
    }
  }, [step]);

  const canAdvance = useMemo(() => {
    switch (step) {
      case 1: return true; // brands are optional
      case 2: return true; // size is optional
      case 3: return answers.first_name.trim().length > 0;
      case 4: return true; // product URL is optional
      default: return false;
    }
  }, [step, answers]);

  // ── Step 5: Google OAuth ──────────────────────────────────────────

  async function handleGoogleSignIn() {
    // Serialize answers into the hidden form field; the existing
    // signInWithGoogleAction reads form data. We also set a cookie
    // as backup for the callback route.
    document.cookie = `onboarding_answers=${encodeURIComponent(
      JSON.stringify(answers),
    )}; path=/; max-age=600; SameSite=Lax`;
    // The form submission will be intercepted by the existing action
  }

  // ── Step 5: Email signup ──────────────────────────────────────────

  function handleEmailSignUp(formData: FormData) {
    // Append onboarding answers to form data
    formData.set("onboarding", JSON.stringify(answers));
    // Also set cookie for metadata persistence after email confirmation
    document.cookie = `onboarding_answers=${encodeURIComponent(
      JSON.stringify(answers),
    )}; path=/; max-age=600; SameSite=Lax`;
    formAction(formData);
  }

  // ── Step transitions ──────────────────────────────────────────────

  function next() {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  }

  function back() {
    if (step > 1) setStep((s) => s - 1);
  }

  const stepLabel = t.auth.onboarding.stepLabel(step, TOTAL_STEPS);

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/40">
          {stepLabel}
        </p>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                i < step ? "bg-ink" : "bg-ink/15",
              )}
            />
          ))}
        </div>
      </div>

      {/* Step title */}
      <div className="min-h-[80px]">
        {step === 1 && (
          <>
            <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tighter text-ink">
              {t.auth.onboarding.brandsTitle}
            </h2>
          </>
        )}
        {step === 2 && (
          <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tighter text-ink">
            {t.auth.onboarding.sizeTitle}
          </h2>
        )}
        {step === 3 && (
          <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tighter text-ink">
            {t.auth.onboarding.nameTitle}
          </h2>
        )}
        {step === 4 && (
          <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tighter text-ink">
            {t.auth.onboarding.productTitle}
          </h2>
        )}
        {step === 5 && (
          <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tighter text-ink">
            {t.auth.onboarding.signupTitle}
          </h2>
        )}
      </div>

      {/* Step content */}
      <div className="min-h-[160px]">
        {step === 1 && <BrandStep answers={answers} setAnswers={setAnswers} />}
        {step === 2 && <SizeStep answers={answers} setAnswers={setAnswers} />}
        {step === 3 && <NameStep answers={answers} setAnswers={setAnswers} />}
        {step === 4 && <ProductStep answers={answers} setAnswers={setAnswers} />}
        {step === 5 && (
          <SignupStep
            answers={answers}
            setAnswers={setAnswers}
            locale={locale}
            isPending={isPending}
            state={state}
            onGoogleSignIn={handleGoogleSignIn}
            onEmailSignUp={handleEmailSignUp}
          />
        )}
      </div>

      {/* Navigation */}
      {step < 5 && (
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={back}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper shadow-brutal-sm hover-press"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={next}
            disabled={!canAdvance}
            className={cn(
              "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border-2 border-ink bg-[var(--brand-orange)] px-6 font-display text-sm font-bold uppercase tracking-widest text-ink shadow-brutal hover-press",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            {step === 3
              ? t.auth.onboarding.nameContinue
              : step === 4
                ? (answers.missed_product_url?.trim()
                    ? t.auth.onboarding.productCta
                    : t.auth.onboarding.productSkip)
                : t.auth.onboarding.brandsContinue}
          </button>
        </div>
      )}

      {/* Skip for product step */}
      {step === 4 && !answers.missed_product_url?.trim() && (
        <button
          type="button"
          onClick={next}
          className="w-full text-center text-sm text-ink/50 underline underline-offset-4 hover:text-ink/80"
        >
          {t.auth.onboarding.productSkip}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit 2>&1 | head -30`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/auth/onboarding-flow.tsx
git commit -m "feat: add OnboardingFlow orchestrator with step navigation"
```

---

### Task 4: Update signup page to use OnboardingFlow

**Files:**
- Modify: `frontend/app/(auth)/signup/page.tsx`

- [ ] **Step 1: Replace the page content**

Replace the entire file content:

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { OnboardingFlow } from "@/components/auth/onboarding-flow";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useLocale } from "@/components/site/locale-provider";

export default function SignupPage() {
  const isConfigured = isSupabaseConfigured();

  // NOTE: NotConfiguredCard is inlined here since it's a simple fallback state
  if (!isConfigured) {
    return (
      <main data-testid="signup-page" className="relative min-h-[80dvh] overflow-hidden">
        <div className="dot-paper pointer-events-none absolute inset-0" aria-hidden />
        <div className="container relative mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
          <section className="relative mx-auto max-w-lg">
            <div className="relative rounded-3xl border-2 border-ink bg-paper p-7 shadow-brutal-xl md:p-9">
              <div className="mb-7">
                <Logo size="md" />
              </div>
              <div className="rounded-2xl border-2 border-ink bg-[var(--brand-orange)] p-6 shadow-brutal">
                <h3 className="font-display text-2xl font-extrabold tracking-tight text-ink">
                  Auth bientôt en ligne
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">
                  On finalise la configuration de l'authentification. En attendant, inscris-toi à la liste d'attente — on t'écrit dès l'ouverture.
                </p>
                <Link
                  href="/#waitlist"
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border-2 border-ink bg-ink px-4 font-display text-xs font-bold uppercase tracking-widest text-cream shadow-brutal-sm hover-press"
                >
                  Rejoindre la liste
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main data-testid="signup-page" className="relative min-h-[80dvh] overflow-hidden">
      <div className="dot-paper pointer-events-none absolute inset-0" aria-hidden />
      <div className="container relative mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:py-20">
        {/* LEFT — visual */}
        <aside className="relative hidden lg:block">
          <div className="absolute -right-6 top-10 hidden h-28 w-28 -rotate-6 rounded-2xl border-2 border-ink bg-[var(--brand-lime)] lg:block" />
          <div className="absolute -left-4 bottom-20 hidden h-20 w-20 rotate-12 rounded-full border-2 border-ink bg-[var(--brand-blue)] lg:block" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://static.prod-images.emergentagent.com/jobs/40fdc8e3-cfec-4df7-8e98-e85f89d6fe27/images/900cf514768684e136ea91a398eefac18ad6e9aa5d094d05f3780a8e1cb11a73.png"
            alt=""
            className="stamp-spin h-28 w-28 drop-shadow-[2px_2px_0_var(--ink)]"
          />
          <h2 className="mt-10 font-display text-5xl font-extrabold leading-[0.95] tracking-tighter text-ink">
            Crée ton compte.
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/70">
            Trois minutes pour ne plus jamais rater ta taille.
          </p>
        </aside>

        {/* RIGHT — form card */}
        <section className="relative">
          <div className="absolute -right-4 -top-6 hidden h-20 w-20 -rotate-6 rounded-2xl border-2 border-ink bg-[var(--brand-lime)] md:block" />
          <div className="relative rounded-3xl border-2 border-ink bg-paper p-7 shadow-brutal-xl md:p-9">
            <div className="mb-7">
              <Logo size="md" />
            </div>
            <OnboardingFlow />
          </div>
        </section>
      </div>
    </main>
  );
}
```

Note: we need to export `NotConfiguredCard` from the login form. Let's handle that.

Actually, let's keep it simpler — just inline the not-configured state or import it differently. Let me check the existing signup page has the not-configured state already in signup-form.tsx.

The signup-form currently handles this. Since we're removing signup-form usage from the page, we need to handle it. Let's extract NotConfiguredCard into a shared component or just duplicate the markup in the page.

Better approach: keep the not-configured check inline in the page as shown above. The `NotConfiguredCard` from login page isn't exported — let's just inline the markup.

- [ ] **Step 2: Verify compilation**

Run: `cd frontend && npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(auth\)/signup/page.tsx
git commit -m "feat: replace signup page with OnboardingFlow component"
```

---

### Task 5: Update signup actions to persist onboarding data

**Files:**
- Modify: `frontend/app/(auth)/signup/actions.ts`
- Modify: `frontend/app/auth/callback/route.ts`
- Modify: `frontend/app/(auth)/login/oauth-actions.ts`

- [ ] **Step 1: Update signupAction to accept onboarding data**

In `actions.ts`, after the `supabase.auth.signUp` call and before returning success, add user metadata update:

In the signup success path (around line 110-116), change to:

```ts
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      locale,
      ...parseOnboarding(formData),
    },
    emailRedirectTo: `${getSiteUrl()}/auth/confirm`,
  },
});
```

Add the helper at the top of the file:

```ts
function parseOnboarding(formData: FormData): Record<string, unknown> {
  try {
    const raw = formData.get("onboarding");
    if (typeof raw === "string" && raw) {
      const parsed = JSON.parse(raw);
      return {
        first_name: parsed.first_name || "",
        preferred_brands: parsed.preferred_brands || [],
        preferred_size: parsed.preferred_size || null,
        missed_product_url: parsed.missed_product_url || null,
      };
    }
  } catch { /* ignore */ }
  return {};
}
```

- [ ] **Step 2: Update OAuth callback to read onboarding cookie**

In `frontend/app/auth/callback/route.ts`, after the successful `exchangeCodeForSession`, add:

```ts
// Apply onboarding answers from cookie if present
const onboardingCookie = request.cookies.get("onboarding_answers");
if (onboardingCookie?.value) {
  try {
    const onboarding = JSON.parse(decodeURIComponent(onboardingCookie.value));
    await supabase.auth.updateUser({
      data: {
        first_name: onboarding.first_name || "",
        preferred_brands: onboarding.preferred_brands || [],
        preferred_size: onboarding.preferred_size || null,
        missed_product_url: onboarding.missed_product_url || null,
      },
    });
  } catch { /* ignore malformed cookie */ }
  // Clear the cookie
  redirectResponse.cookies.set("onboarding_answers", "", { maxAge: 0, path: "/" });
}
```

- [ ] **Step 3: Update Google sign-in action to include onboarding in cookie**

The existing `signInWithGoogleAction` in `frontend/app/(auth)/login/oauth-actions.ts` — the cookie is already set client-side in the OnboardingFlow's `handleGoogleSignIn`, so no changes needed to the server action itself. But let's verify the action reads the form's locale field correctly.

Actually, looking at the oauth-actions.ts: the hidden input with `onboarding` JSON is in the form. The Google sign-in action does `signInWithOAuth` which redirects to Google. The form data is NOT sent to Google — the cookie approach handles it. Good.

- [ ] **Step 4: Verify compilation**

Run: `cd frontend && npx tsc --noEmit 2>&1 | head -30`

- [ ] **Step 5: Commit**

```bash
git add frontend/app/\(auth\)/signup/actions.ts frontend/app/auth/callback/route.ts
git commit -m "feat: persist onboarding answers to user_metadata on signup"
```

---

### Task 6: Handle post-signup watch creation for missed product URL

**Files:**
- Modify: `frontend/app/auth/callback/route.ts`
- Modify: `frontend/app/(auth)/signup/actions.ts`

- [ ] **Step 1: After email signup, if missed_product_url is provided, create a watch**

The signup action already stores the data in user_metadata. We also want to create a watch immediately after email confirmation. Since email confirmation happens in `/auth/confirm`, we can handle it there.

Actually, simpler approach: after successful email signup, redirect to `/dashboard/add?url=...` if a product URL was provided. The user will confirm their email first, but the URL is in the redirect.

Let's keep this lightweight — store the URL in user_metadata and handle watch creation on first dashboard visit or via the worker. The spec says "if missed_product_url is provided, call analyzeUrl + createWatch after signup."

For email signup, the user needs to confirm their email before they can create a watch. So we store it and redirect after confirmation.

For Google sign-in (immediate session), we can create the watch on the callback route.

**Google callback**: Add after updating user metadata in callback/route.ts:

```ts
// Create first watch if user provided a product URL during onboarding
if (onboarding?.missed_product_url) {
  try {
    // We need admin client to bypass RLS since the user session may not be fully ready
    const adminClient = createAdminClient();
    if (adminClient) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await adminClient.from("watches").insert({
          user_id: user.id,
          url: onboarding.missed_product_url,
          variant_label: onboarding.preferred_size ? `Taille ${onboarding.preferred_size}` : null,
          variant_id: onboarding.preferred_size || null,
          is_active: true,
        });
      }
    }
  } catch { /* watch creation is best-effort */ }
}
```

Wait, this is getting complex. Let's simplify: just store in user_metadata and handle watch creation after the user arrives on dashboard. The `missed_product_url` is stored — we can pre-fill the add-watch form with it.

Let's modify the success redirect to pass the URL as a query param: `/dashboard/add?url=...`.

- [ ] **Step 1 Update the Google callback redirect when onboarding URL is present**

In `callback/route.ts`, after processing onboarding, modify the redirect:

```ts
// If user provided a product URL, redirect to add-watch page with it pre-filled
if (onboarding?.missed_product_url) {
  destination.pathname = "/dashboard/add";
  destination.searchParams.set("url", onboarding.missed_product_url);
}
```

This is simpler and more reliable than trying to create the watch server-side.

- [ ] **Step 2: Commit**

```bash
git add frontend/app/auth/callback/route.ts
git commit -m "feat: redirect to /dashboard/add with URL after Google signup onboarding"
```

---

### Task 7: Final verification

- [ ] **Step 1: Type check the full project**

```bash
cd frontend && npx tsc --noEmit 2>&1 | tail -20
```
Expected: no errors.

- [ ] **Step 2: Run lint**

```bash
cd frontend && npx eslint components/auth/ app/\(auth\)/signup/ --ext .ts,.tsx 2>&1 | tail -20
```

- [ ] **Step 3: Build check**

```bash
cd frontend && npx next build 2>&1 | tail -30
```
Expected: successful build.

- [ ] **Step 4: Start dev server and test**

```bash
cd frontend && npm run dev
```

Navigate to http://localhost:3000/signup and verify:
- Steps 1-4 collect data and advance
- "Back" button works
- localStorage preserves answers on refresh
- Signup form at step 5 works
- Google OAuth sets cookie and redirects

- [ ] **Step 5: Final commit if any fixes were made**
