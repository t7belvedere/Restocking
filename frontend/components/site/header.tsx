"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { useMessages, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Props = {
  isAuthenticated?: boolean;
};

export function SiteHeader({ isAuthenticated = false }: Props) {
  const t = useMessages();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages = t as any;

  const handleLocaleChange = useCallback(
    (nextLocale: string) => {
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      router.refresh();
    },
    [router],
  );

  const navItems = [
    { href: "/", label: messages.nav.home, testId: "nav-home" },
    { href: "/how-it-works", label: messages.nav.how, testId: "nav-how-it-works" },
    { href: "/retailers", label: messages.nav.retailers, testId: "nav-retailers" },
    { href: "/pricing", label: messages.nav.pricing, testId: "nav-pricing" },
    { href: "/faq", label: messages.nav.faq, testId: "nav-faq" },
    { href: "/manifesto", label: messages.nav.manifesto, testId: "nav-manifesto" },
  ];

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
          {navItems.map((item) => {
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

          <Link
            href="/dashboard"
            data-testid="header-cta-dashboard"
            className="hidden h-10 items-center justify-center gap-1.5 rounded-full border-2 border-ink bg-ink px-4 font-display text-sm font-bold uppercase tracking-wide text-cream shadow-brutal hover-press md:inline-flex"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            {locale === "fr" ? "Tableau de bord" : "Dashboard"}
          </Link>

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
            {navItems.map((item) => (
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

            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              data-testid="mobile-header-cta-dashboard"
              className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-ink font-display font-bold uppercase tracking-wide text-cream shadow-brutal"
            >
              <LayoutDashboard className="h-4 w-4" />
              {locale === "fr" ? "Tableau de bord" : "Dashboard"}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

const ALL_LOCALES = ["fr", "en", "es", "de", "it"] as const;

function LocaleSwitch({
  locale,
  onChange,
}: {
  locale: string;
  onChange: (l: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" data-testid="locale-switcher">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        className="inline-flex h-10 w-12 items-center justify-center gap-1 rounded-full border-2 border-ink bg-paper text-xs font-bold uppercase tracking-widest shadow-brutal-sm transition-colors hover:bg-cream"
      >
        {locale}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={cn("transition-transform", open && "rotate-180")}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-1.5 min-w-[6rem] rounded-2xl border-2 border-ink bg-paper py-1 shadow-brutal">
            {ALL_LOCALES.map((l) => {
              const active = locale === l;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    onChange(l);
                    setOpen(false);
                  }}
                  data-testid={`locale-${l}`}
                  className={cn(
                    "block w-full px-4 py-2 text-left text-xs font-bold uppercase tracking-widest transition-colors",
                    active ? "bg-ink text-cream" : "text-ink/60 hover:bg-cream hover:text-ink",
                  )}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
