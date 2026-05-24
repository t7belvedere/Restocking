"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { useLocale } from "@/components/site/locale-provider";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/messages";

function getNavItems(t: ReturnType<typeof useLocale>["t"]) {
  return [
    { href: "/", label: t.nav.home, testId: "nav-home" },
    { href: "/how-it-works", label: t.nav.how, testId: "nav-how-it-works" },
    { href: "/retailers", label: t.nav.retailers, testId: "nav-retailers" },
    { href: "/pricing", label: t.nav.pricing, testId: "nav-pricing" },
    { href: "/faq", label: t.nav.faq, testId: "nav-faq" },
    { href: "/manifesto", label: t.nav.manifesto, testId: "nav-manifesto" },
  ];
}

type Props = {
  isAuthenticated?: boolean;
};

export function SiteHeader({ isAuthenticated = false }: Props) {
  const { t, locale, setLocale } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLocaleChange = useCallback(
    (l: Locale) => {
      setLocale(l);
      // Set cookie so server re-renders with correct locale on next navigation
      document.cookie = `restocking.locale=${l};path=/;max-age=31536000;SameSite=Lax`;
      router.refresh();
    },
    [router, setLocale],
  );

  const items = getNavItems(t);

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-40 border-b-2 border-ink bg-cream/85 backdrop-blur"
    >
      <div className="container-grid relative mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-8">
        <Logo href="/" size="md" />

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 lg:flex"
          data-testid="primary-nav"
        >
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={item.testId}
                className={cn(
                  "rounded-full border-2 border-transparent px-3.5 py-1.5 text-sm font-semibold text-ink/80 transition-colors",
                  "hover:border-ink hover:bg-paper",
                  active && "border-ink bg-paper text-ink shadow-brutal-sm",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitch locale={locale} onChange={handleLocaleChange} />

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              data-testid="header-cta-dashboard"
              className="hidden h-10 items-center justify-center gap-1.5 rounded-full border-2 border-ink bg-ink px-4 font-display text-sm font-bold uppercase tracking-wide text-cream shadow-brutal hover-press md:inline-flex"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              {locale === "fr" ? "Tableau de bord" : "Dashboard"}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                data-testid="header-cta-signin"
                className="hidden h-10 items-center justify-center gap-1.5 rounded-full border-2 border-transparent px-3 font-display text-sm font-bold uppercase tracking-wide text-ink hover:border-ink hover:bg-paper md:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" />
                {t.auth.signIn}
              </Link>
              <Link
                href="/signup"
                data-testid="header-cta-signup"
                className="hidden h-10 items-center justify-center rounded-full border-2 border-ink bg-ink px-4 font-display text-sm font-bold uppercase tracking-wide text-cream shadow-brutal hover-press md:inline-flex"
              >
                {t.auth.signUp}
              </Link>
            </>
          )}

          <button
            type="button"
            aria-label="Toggle menu"
            data-testid="mobile-menu-toggle"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-paper shadow-brutal-sm hover-press lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          data-testid="mobile-nav"
          className="border-t-2 border-ink bg-paper lg:hidden"
        >
          <nav className="container mx-auto flex max-w-7xl flex-col px-5 py-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                data-testid={`mobile-${item.testId}`}
                className={cn(
                  "border-b border-ink/10 py-3 font-display text-xl font-bold tracking-tight",
                  pathname === item.href
                    ? "text-[var(--brand-orange)]"
                    : "text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                data-testid="mobile-header-cta-dashboard"
                className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-ink font-display font-bold uppercase tracking-wide text-cream shadow-brutal"
              >
                <LayoutDashboard className="h-4 w-4" />
                {locale === "fr" ? "Tableau de bord" : "Dashboard"}
              </Link>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  data-testid="mobile-header-cta-signin"
                  className="inline-flex h-12 items-center justify-center rounded-full border-2 border-ink bg-paper font-display font-bold uppercase tracking-wide text-ink shadow-brutal-sm"
                >
                  {t.auth.signIn}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  data-testid="mobile-header-cta-signup"
                  className="inline-flex h-12 items-center justify-center rounded-full border-2 border-ink bg-ink font-display font-bold uppercase tracking-wide text-cream shadow-brutal"
                >
                  {t.auth.signUp}
                </Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function LocaleSwitch({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (l: Locale) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Language"
      data-testid="locale-switcher"
      className="inline-flex h-10 items-center rounded-full border-2 border-ink bg-paper p-0.5 text-xs font-bold uppercase tracking-widest shadow-brutal-sm"
    >
      {(["fr", "en"] as const).map((l) => {
        const active = locale === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => onChange(l)}
            data-testid={`locale-${l}`}
            aria-pressed={active}
            className={cn(
              "h-full rounded-full px-3 transition-colors",
              active ? "bg-ink text-cream" : "text-ink/60 hover:text-ink",
            )}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
