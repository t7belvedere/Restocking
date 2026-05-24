"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/components/site/locale-provider";
import { loginAction, type LoginState } from "./actions";
import { signInWithAppleAction, signInWithGoogleAction } from "./oauth-actions";
import { cn } from "@/lib/utils";

const initialState: LoginState = { status: "idle" };

const ERROR_MAP: Record<string, { fr: string; en: string }> = {
  "auth-not-configured": {
    fr: "L’authentification n’est pas configurée pour le moment.",
    en: "Authentication is not configured right now.",
  },
  "oauth-callback-failed": {
    fr: "La connexion Google a échoué. Réessaie.",
    en: "Google sign-in failed. Please try again.",
  },
  "oauth-init-failed": {
    fr: "Impossible de démarrer la connexion Google.",
    en: "Could not start Google sign-in.",
  },
  "missing-oauth-code": {
    fr: "Le retour Google n’a pas pu être validé.",
    en: "Google callback could not be validated.",
  },
  "invalid-or-expired-link": {
    fr: "Ce lien est expiré ou déjà utilisé.",
    en: "This link is expired or already used.",
  },
};

export function LoginForm({ isAuthConfigured }: { isAuthConfigured: boolean }) {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const errorCode = searchParams.get("error");

  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (errorCode && ERROR_MAP[errorCode]) {
      toast.error(ERROR_MAP[errorCode][locale]);
    }
  }, [errorCode, locale]);

  useEffect(() => {
    if (state.status === "error" && state.formError) {
      toast.error(state.formError);
    }
  }, [state]);

  if (!isAuthConfigured) {
    return (
      <NotConfiguredCard
        title={t.auth.notConfiguredTitle}
        body={t.auth.notConfiguredBody}
        ctaLabel={t.auth.notConfiguredCta}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <form action={signInWithGoogleAction} data-testid="login-google-form">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            data-testid="login-google-button"
            className="group inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border-2 border-ink bg-paper px-4 font-display text-sm font-bold uppercase tracking-widest text-ink shadow-brutal hover-press"
          >
            <GoogleIcon className="h-5 w-5" />
            {t.auth.continueGoogle}
          </button>
        </form>

        <form action={signInWithAppleAction} data-testid="login-apple-form">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            data-testid="login-apple-button"
            className="group inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border-2 border-ink bg-ink px-4 font-display text-sm font-bold uppercase tracking-widest text-cream shadow-brutal hover-press"
          >
            <AppleIcon className="h-5 w-5" />
            {t.auth.continueApple}
          </button>
        </form>
      </div>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-ink/20" />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
          {t.auth.orContinue}
        </span>
        <span className="h-px flex-1 bg-ink/20" />
      </div>

      <form action={formAction} className="space-y-4" data-testid="login-form" noValidate>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block font-display text-xs font-bold uppercase tracking-[0.2em] text-ink"
          >
            {t.auth.email}
          </label>
          <input
            id="login-email"
            data-testid="login-email-input"
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
            <p
              data-testid="login-email-error"
              className="text-xs font-medium text-[oklch(0.55_0.22_27)]"
            >
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block font-display text-xs font-bold uppercase tracking-[0.2em] text-ink"
            >
              {t.auth.password}
            </label>
            <Link
              href="/forgot-password"
              data-testid="login-forgot-link"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/60 hover:text-ink"
            >
              {t.auth.forgotPassword}
            </Link>
          </div>
          <input
            id="login-password"
            data-testid="login-password-input"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(state.fieldErrors?.password)}
            disabled={isPending}
            className={cn(
              "h-12 w-full rounded-xl border-2 border-ink bg-paper px-4 font-medium text-ink shadow-brutal-sm",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/40",
              state.fieldErrors?.password && "border-[oklch(0.55_0.22_27)]",
            )}
          />
          {state.fieldErrors?.password ? (
            <p
              data-testid="login-password-error"
              className="text-xs font-medium text-[oklch(0.55_0.22_27)]"
            >
              {state.fieldErrors.password}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isPending}
          data-testid="login-submit-button"
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
              {t.auth.signInSubmit}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        {state.status === "error" && state.formError ? (
          <div
            data-testid="login-error-alert"
            className="rounded-xl border-2 border-[oklch(0.55_0.22_27)] bg-[oklch(0.97_0.04_27)] p-3"
          >
            <p className="text-sm font-medium text-[oklch(0.4_0.2_27)]">
              {state.formError}
            </p>
          </div>
        ) : null}
      </form>

      <p className="text-center text-sm text-ink/70">
        {t.auth.noAccount}{" "}
        <Link
          href="/signup"
          data-testid="login-to-signup-link"
          className="font-bold text-ink underline decoration-[var(--brand-orange)] decoration-2 underline-offset-4 hover:decoration-ink"
        >
          {t.auth.signUp}
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

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.18 1.27-2.15 3.55.03 2.85 2.5 3.79 2.53 3.8-.03.07-.39 1.35-1.29 2.67zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.02 3.18-.7.84-1.87 1.5-2.98 1.42-.15-1.15.4-2.31 1.06-3.1z" />
    </svg>
  );
}
