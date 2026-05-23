"use client";

import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { useLocale } from "@/components/site/locale-provider";

export function SiteFooter() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer
      data-testid="site-footer"
      className="relative border-t-2 border-ink bg-ink text-cream"
    >
      <div className="absolute inset-0 dot-paper" aria-hidden style={{ opacity: 0.08 }} />
      <div className="container mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <Logo size="lg" inverted />
          <p className="max-w-sm text-sm text-cream/70">{t.footer.tagline}</p>
          <p className="text-xs text-cream/50">{t.footer.madeIn}</p>
        </div>

        <div className="space-y-3">
          <h4 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-lime)]">
            {t.footer.product}
          </h4>
          <ul className="space-y-2 text-sm text-cream/80">
            <li>
              <Link
                href="/how-it-works"
                data-testid="footer-nav-how"
                className="hover:text-[var(--brand-lime)]"
              >
                {t.nav.how}
              </Link>
            </li>
            <li>
              <Link
                href="/retailers"
                data-testid="footer-nav-retailers"
                className="hover:text-[var(--brand-lime)]"
              >
                {t.nav.retailers}
              </Link>
            </li>
            <li>
              <Link
                href="/pricing"
                data-testid="footer-nav-pricing"
                className="hover:text-[var(--brand-lime)]"
              >
                {t.nav.pricing}
              </Link>
            </li>
            <li>
              <Link
                href="/manifesto"
                data-testid="footer-nav-manifesto"
                className="hover:text-[var(--brand-lime)]"
              >
                {t.nav.manifesto}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-lime)]">
            {t.footer.legal}
          </h4>
          <ul className="space-y-2 text-sm text-cream/80">
            <li>
              <Link
                href="/privacy"
                data-testid="footer-link-privacy"
                className="hover:text-[var(--brand-lime)]"
              >
                {t.footer.links.privacy}
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                data-testid="footer-link-terms"
                className="hover:text-[var(--brand-lime)]"
              >
                {t.footer.links.terms}
              </Link>
            </li>
            <li>
              <Link
                href="/cookies"
                data-testid="footer-link-cookies"
                className="hover:text-[var(--brand-lime)]"
              >
                {t.footer.links.cookies}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-lime)]">
            Contact
          </h4>
          <ul className="space-y-2 text-sm text-cream/80">
            <li>
              <a
                href="mailto:hello@restocking.app"
                data-testid="footer-contact-email"
                className="hover:text-[var(--brand-lime)]"
              >
                {t.footer.links.contact}
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com/restockingapp"
                target="_blank"
                rel="noreferrer"
                data-testid="footer-contact-twitter"
                className="hover:text-[var(--brand-lime)]"
              >
                Twitter / X
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/restocking.app"
                target="_blank"
                rel="noreferrer"
                data-testid="footer-contact-instagram"
                className="hover:text-[var(--brand-lime)]"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/15 px-5 py-5 text-center text-xs text-cream/50 lg:px-8">
        © {year} restocking.app — {t.footer.rights}
      </div>
    </footer>
  );
}
