"use client";

import { cn } from "@/lib/utils";
import type { WordmarkStyle } from "@/lib/data/retailers";

const STYLE_CLASSES: Record<WordmarkStyle, string> = {
  // Bold serif — Zara/Massimo Dutti energy
  "serif-bold":
    "font-['Playfair_Display',ui-serif,Georgia,serif] font-black tracking-[0.06em]",
  // Italic serif — Stradivarius / boutique
  "serif-italic":
    "font-['Playfair_Display',ui-serif,Georgia,serif] font-medium italic tracking-tight",
  // Ultra-thin elegant serif — Sézane / Acne / Lisa Yang
  "italiana-thin":
    "font-['Italiana',ui-serif,Georgia,serif] font-normal tracking-[0.08em]",
  // Thin serif caps — Aritzia / Khaite / Vince
  "italiana-caps":
    "font-['Italiana',ui-serif,Georgia,serif] font-normal uppercase tracking-[0.12em]",
  // Heavy condensed — Ganni / Carhartt / Bershka
  "anton-caps":
    "font-['Anton',ui-sans-serif,system-ui,sans-serif] font-normal uppercase tracking-tight",
  // Mono caps — A.P.C.
  "mono-caps":
    "font-mono font-bold uppercase tracking-[0.18em]",
  // Bricolage extra bold compressed — Weekday / Monki
  "bricolage-tight":
    "font-display font-extrabold tracking-tighter",
  // Bricolage all-caps spaced — Arket / Maje / Sandro / The Frankie Shop
  "bricolage-wide":
    "font-display font-bold uppercase tracking-[0.18em]",
  // DM Sans ultra-thin caps — COS / Mango / Reformation / Toteme
  "dm-thin-caps":
    "font-sans font-light uppercase tracking-[0.18em]",
  // DM Sans bold — Frame
  "dm-bold": "font-sans font-bold uppercase tracking-[0.05em]",
  // Geist-style heavy sans — Uniqlo / ASOS / Arc'teryx
  "geist-bold":
    "font-display font-extrabold uppercase tracking-tight",
};

type Props = {
  name: string;
  style: WordmarkStyle;
  className?: string;
  accent?: "ink" | "orange" | "blue" | "lime" | "red";
};

const ACCENT_CLASSES = {
  ink: "text-ink",
  orange: "text-[var(--brand-orange)]",
  blue: "text-[var(--brand-blue)]",
  lime: "text-[var(--brand-lime)]",
  red: "text-[oklch(0.55_0.22_27)]",
} as const;

/**
 * Renders the brand name as a typographic wordmark.
 * NOTE: we deliberately do not use the brand's real logo asset. This is a
 * type-only interpretation that *evokes* the identity while remaining
 * obviously our own treatment (small caps tracking, Italiana, Anton, etc.).
 */
export function BrandWordmark({ name, style, className, accent = "ink" }: Props) {
  return (
    <span
      data-testid="brand-wordmark"
      className={cn(
        STYLE_CLASSES[style],
        ACCENT_CLASSES[accent],
        "leading-none",
        className,
      )}
    >
      {name}
    </span>
  );
}
