"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { resetPasswordAction, type ResetPasswordState } from "./actions";
import { cn } from "@/lib/utils";

const initialState: ResetPasswordState = { status: "idle" };

export function ResetPasswordForm({ isAuthConfigured }: { isAuthConfigured: boolean }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  const hasError = searchParams.get("error") === "expired";

  useEffect(() => {
    if (state.status === "success") {
      const timeout = setTimeout(() => router.push("/login"), 2000);
      return () => clearTimeout(timeout);
    }
  }, [state.status, router]);

  if (!isAuthConfigured) {
    return <NotConfiguredCard />;
  }

  if (hasError) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border-2 border-[oklch(0.55_0.22_27)] bg-[oklch(0.97_0.04_27)] p-5 text-center">
          <p className="text-sm font-medium text-[oklch(0.4_0.2_27)]">
            {t("auth.resetPasswordError")}
          </p>
        </div>
        <p className="text-center">
          <Link
            href="/forgot-password"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60 hover:text-ink"
          >
            {t("auth.forgotPasswordBackToLogin")}
          </Link>
        </p>
      </div>
    );
  }

  if (state.status === "success") {
    return (
      <div className="space-y-3 rounded-xl border-2 border-ink bg-[var(--brand-lime)] p-5 text-center shadow-brutal-sm">
        <p className="text-sm font-bold text-ink">{t("auth.resetPasswordSuccess")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="locale" value={locale} />

        <div className="space-y-1.5">
          <label
            htmlFor="reset-password"
            className="block font-display text-xs font-bold uppercase tracking-[0.2em] text-ink"
          >
            {t("auth.resetPasswordNewPassword")}
          </label>
          <input
            id="reset-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            autoFocus
            minLength={8}
            aria-invalid={Boolean(state.fieldErrors?.password)}
            disabled={isPending}
            className={cn(
              "h-12 w-full rounded-xl border-2 border-ink bg-paper px-4 font-medium text-ink shadow-brutal-sm",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/40",
              state.fieldErrors?.password && "border-[oklch(0.55_0.22_27)]",
            )}
          />
          {state.fieldErrors?.password ? (
            <p className="text-xs font-medium text-[oklch(0.55_0.22_27)]">
              {state.fieldErrors.password}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isPending}
          data-testid="reset-submit-button"
          className={cn(
            "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-ink",
            "bg-ink font-display text-sm font-bold uppercase tracking-widest text-cream shadow-brutal hover-press",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {t("auth.resetPasswordSubmit")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        {state.status === "error" && state.formError ? (
          <div className="rounded-xl border-2 border-[oklch(0.55_0.22_27)] bg-[oklch(0.97_0.04_27)] p-3">
            <p className="text-sm font-medium text-[oklch(0.4_0.2_27)]">{state.formError}</p>
          </div>
        ) : null}
      </form>
    </div>
  );
}

function NotConfiguredCard() {
  const t = useTranslations();
  return (
    <div
      data-testid="auth-not-configured"
      className="rounded-2xl border-2 border-ink bg-[var(--brand-orange)] p-6 shadow-brutal"
    >
      <h3 className="font-display text-2xl font-extrabold tracking-tight text-ink">
        {t("auth.notConfiguredTitle")}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink/80">{t("auth.notConfiguredBody")}</p>
      <Link
        href="/#waitlist"
        data-testid="auth-not-configured-cta"
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border-2 border-ink bg-ink px-4 font-display text-xs font-bold uppercase tracking-widest text-cream shadow-brutal-sm hover-press"
      >
        {t("auth.notConfiguredCta")}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
