"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { signupAction, type SignupState } from "@/app/(auth)/signup/actions";
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
  const t = useTranslations();
  const locale = useLocale();
  const [step, setStep] = useState(1);
  const [answers, setAnswersState] = useState<OnboardingAnswers>(loadAnswers);
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(signupAction, {
    status: "idle",
  } as SignupState);

  const setAnswers = useCallback((a: OnboardingAnswers) => {
    setAnswersState(a);
    saveAnswers(a);
  }, []);

  // Clean up localStorage on successful completion
  useEffect(() => {
    if (step > TOTAL_STEPS) {
      clearAnswers();
    }
  }, [step]);

  const canAdvance = useMemo(() => {
    switch (step) {
      case 1:
        return true; // brands optional
      case 2:
        return true; // size optional
      case 3:
        return answers.first_name.trim().length > 0;
      case 4:
        return true; // product URL optional
      default:
        return false;
    }
  }, [step, answers]);

  // ── Step 5: Google OAuth ──────────────────────────────────────────

  function handleGoogleSignIn() {
    // Set cookie so the OAuth callback can read onboarding answers
    document.cookie = `onboarding_answers=${encodeURIComponent(
      JSON.stringify(answers),
    )}; path=/; max-age=600; SameSite=Lax`;
  }

  // ── Step 5: Email signup ──────────────────────────────────────────

  const [confirmError, setConfirmError] = useState<string | null>(null);

  function handleEmailSignUp(formData: FormData) {
    const pwd = formData.get("password") as string;
    const confirm = formData.get("confirm_password") as string;

    // Client-side password match check
    if (pwd && confirm && pwd !== confirm) {
      setConfirmError(
        locale === "fr"
          ? "Les mots de passe ne correspondent pas."
          : "Passwords do not match.",
      );
      return;
    }
    setConfirmError(null);

    // Append onboarding answers to form data
    formData.set("onboarding", JSON.stringify(answers));
    // Also set cookie for metadata persistence after email confirmation
    document.cookie = `onboarding_answers=${encodeURIComponent(
      JSON.stringify(answers),
    )}; path=/; max-age=600; SameSite=Lax`;
    formAction(formData);
  }

  // ── Check if signup was successful (email verification sent) ──────
  // When state.status === "success", we move to the success step
  useEffect(() => {
    if (state.status === "success") {
      setStep(TOTAL_STEPS + 1);
    }
  }, [state.status]);

  // ── Step transitions ──────────────────────────────────────────────

  function next() {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  }

  function back() {
    if (step > 1) setStep((s) => s - 1);
  }

  function handleGoToAdd() {
    const params = new URLSearchParams();
    if (answers.missed_product_url?.trim()) {
      params.set("url", answers.missed_product_url.trim());
    }
    const qs = params.toString();
    router.push(`/dashboard/add${qs ? `?${qs}` : ""}`);
  }

  // ── Success screen (after step 5) ─────────────────────────────────

  if (step > TOTAL_STEPS) {
    return (
      <div className="space-y-5">
        <SuccessStep onGoToAdd={handleGoToAdd} />
      </div>
    );
  }

  const stepLabel = t("auth.onboarding.stepLabel", { current: step, total: TOTAL_STEPS });

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
      <div className="min-h-[72px]">
        {step === 1 && (
          <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tighter text-ink">
            {t("auth.onboarding.brandsTitle")}
          </h2>
        )}
        {step === 2 && (
          <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tighter text-ink">
            {t("auth.onboarding.sizeTitle")}
          </h2>
        )}
        {step === 3 && (
          <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tighter text-ink">
            {t("auth.onboarding.nameTitle")}
          </h2>
        )}
        {step === 4 && (
          <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tighter text-ink">
            {t("auth.onboarding.productTitle")}
          </h2>
        )}
        {step === 5 && (
          <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tighter text-ink">
            {t("auth.onboarding.signupTitle")}
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
            confirmError={confirmError}
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
              ? t("auth.onboarding.nameContinue")
              : step === 4
                ? (answers.missed_product_url?.trim()
                    ? t("auth.onboarding.productCta")
                    : t("auth.onboarding.productSkip"))
                : t("auth.onboarding.brandsContinue")}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Secondary skip for product step */}
      {step === 4 && !answers.missed_product_url?.trim() && (
        <button
          type="button"
          onClick={next}
          className="w-full text-center text-sm text-ink/50 underline underline-offset-4 hover:text-ink/80"
        >
          {t("auth.onboarding.productSkip")}
        </button>
      )}
    </div>
  );
}
