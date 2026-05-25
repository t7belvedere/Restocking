"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, ArrowRight, Loader2, MailCheck } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { forgotPasswordAction, type ForgotPasswordState } from "./actions";
import { cn } from "@/lib/utils";

const initialState: ForgotPasswordState = { status: "idle" };

export function ForgotPasswordForm({ isAuthConfigured }: { isAuthConfigured: boolean }) {
  const t = useTranslations();
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

  if (!isAuthConfigured) {
    return (
      <NotConfiguredCard
        title={t("auth.notConfiguredTitle")}
        body={t("auth.notConfiguredBody")}
        ctaLabel={t("auth.notConfiguredCta")}
      />
    );
  }

  if (state.status === "success") {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink bg-[var(--brand-lime)] shadow-brutal-sm">
          <MailCheck className="h-7 w-7 text-ink" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold tracking-tight text-ink">
            {t("auth.forgotPasswordSuccessTitle")}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            {t("auth.forgotPasswordSuccessBody")}
          </p>
        </div>
        <Link
          href="/login"
          data-testid="forgot-back-login"
          className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-ink bg-paper px-4 font-display text-xs font-bold uppercase tracking-widest text-ink shadow-brutal-sm hover-press"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("auth.forgotPasswordBackToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="locale" value={locale} />

        <div className="space-y-1.5">
          <label
            htmlFor="forgot-email"
            className="block font-display text-xs font-bold uppercase tracking-[0.2em] text-ink"
          >
            {t("auth.email")}
          </label>
          <input
            id="forgot-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            autoFocus
            aria-invalid={Boolean(state.fieldErrors?.email)}
            placeholder={t("auth.emailPlaceholder")}
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

        <button
          type="submit"
          disabled={isPending}
          data-testid="forgot-submit-button"
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
              {t("auth.forgotPasswordSubmit")}
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
      </form>

      <p className="text-center">
        <Link
          href="/login"
          data-testid="forgot-back-login-link"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60 hover:text-ink"
        >
          {t("auth.forgotPasswordBackToLogin")}
        </Link>
      </p>
    </div>
  );
}

function NotConfiguredCard({
  title,
  body,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaLabel: string;
}) {
  return (
    <div
      data-testid="auth-not-configured"
      className="rounded-2xl border-2 border-ink bg-[var(--brand-orange)] p-6 shadow-brutal"
    >
      <h3 className="font-display text-2xl font-extrabold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink/80">{body}</p>
      <Link
        href="/#waitlist"
        data-testid="auth-not-configured-cta"
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border-2 border-ink bg-ink px-4 font-display text-xs font-bold uppercase tracking-widest text-cream shadow-brutal-sm hover-press"
      >
        {ctaLabel}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
