"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useLocale } from "@/components/site/locale-provider";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; message: string; already: boolean; position: number | null }
  | { kind: "error"; message: string };

type Props = {
  testIdPrefix?: string;
  variant?: "default" | "dark";
  className?: string;
};

export function WaitlistForm({
  testIdPrefix = "hero",
  variant = "default",
  className,
}: Props) {
  const { t, locale } = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus({ kind: "error", message: t.common.invalid });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const res = await fetch(`${BACKEND_URL}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          locale,
          referrer:
            typeof document !== "undefined" ? document.referrer : null,
        }),
      });
      if (!res.ok) {
        throw new Error("Request failed");
      }
      const data = (await res.json()) as {
        ok: boolean;
        already_registered: boolean;
        position: number | null;
        message: string;
      };
      setStatus({
        kind: "success",
        message: data.already_registered ? t.common.already : t.common.success,
        already: data.already_registered,
        position: data.position,
      });
      if (!data.already_registered) setEmail("");
    } catch {
      setStatus({ kind: "error", message: t.common.error });
    }
  }

  const isDark = variant === "dark";

  if (status.kind === "success") {
    return (
      <div
        className={cn(
          "rounded-xl border-2 border-ink p-5 shadow-brutal",
          isDark ? "bg-[var(--brand-lime)]" : "bg-[var(--brand-lime)]",
          className,
        )}
        data-testid={`${testIdPrefix}-waitlist-success`}
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper">
            <CheckCircle2 className="h-4 w-4 text-ink" />
          </span>
          <div className="space-y-1">
            <p className="font-display text-lg font-bold leading-tight text-ink">
              {status.message}
            </p>
            {!status.already && status.position ? (
              <p className="text-sm text-ink/80">
                {locale === "fr"
                  ? `Tu es le n°${status.position} sur la liste. On te garde ta place et 3 mois de Pro pour le lancement (top 100).`
                  : `You are number ${status.position} on the list. We’re saving your spot and 3 free months of Pro at launch (top 100).`}
              </p>
            ) : (
              <p className="text-sm text-ink/80">
                {locale === "fr"
                  ? "On t’écrit dès qu’on ouvre les portes. Promis."
                  : "We’ll write the moment we open the doors. Promise."}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn("space-y-3", className)}
      data-testid={`${testIdPrefix}-waitlist-form`}
    >
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-stretch",
        )}
      >
        <label className="sr-only" htmlFor={`${testIdPrefix}-email`}>
          {t.common.yourEmail}
        </label>
        <input
          id={`${testIdPrefix}-email`}
          data-testid={`${testIdPrefix}-email-input`}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t.common.placeholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status.kind === "error") setStatus({ kind: "idle" });
          }}
          required
          className={cn(
            "h-14 flex-1 rounded-xl border-2 border-ink px-4 font-medium text-ink placeholder:text-ink/40",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-orange)]/40",
            isDark ? "bg-paper" : "bg-paper",
            "shadow-brutal-sm",
          )}
        />
        <button
          type="submit"
          data-testid={`${testIdPrefix}-waitlist-submit`}
          disabled={status.kind === "loading"}
          className={cn(
            "group inline-flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-ink px-6 font-display text-base font-bold uppercase tracking-wide",
            "bg-[var(--brand-orange)] text-ink shadow-brutal hover-press",
            "disabled:cursor-not-allowed disabled:opacity-70",
          )}
        >
          {status.kind === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {t.common.joinWaitlist}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
      {status.kind === "error" ? (
        <p
          data-testid={`${testIdPrefix}-waitlist-error`}
          className="text-sm font-medium text-[oklch(0.55_0.22_27)]"
        >
          {status.message}
        </p>
      ) : (
        <p className={cn("text-xs", isDark ? "text-cream/70" : "text-ink/60")}>
          {t.common.privacy}
        </p>
      )}
    </form>
  );
}
