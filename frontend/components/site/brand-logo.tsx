"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BrandWordmark } from "@/components/site/brand-wordmark";
import type { Retailer } from "@/lib/data/retailers";

// Brandfetch Client ID for the Logo API (CDN)
const BRANDFETCH_CLIENT_ID = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID || "1idoVDqRtZmwOL9NXro";

type LogoState = "loading" | "loaded" | "fallback";

type Props = {
  retailer: Pick<Retailer, "name" | "domain" | "wordmark" | "accent">;
  className?: string;
  wordmarkClassName?: string;
};

/**
 * Renders a retailer logo via Brandfetch Logo API (CDN).
 * We use the Client ID for authorized CDN access.
 *
 * On any failure (no logo found, image load error) we degrade to a
 * typographic wordmark — the tile never breaks.
 */
export function BrandLogo({ retailer, className, wordmarkClassName }: Props) {
  const [state, setState] = useState<LogoState>("loading");

  const logoUrl = `https://cdn.brandfetch.io/${retailer.domain}?c=${BRANDFETCH_CLIENT_ID}`;

  if (state === "fallback") {
    return (
      <BrandWordmark
        name={retailer.name}
        style={retailer.wordmark}
        accent={retailer.accent}
        className={wordmarkClassName}
      />
    );
  }

  return (
    <div className="relative flex items-center">
      {state === "loading" && (
        <div
          data-testid={`brand-logo-skeleton-${retailer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
          className={cn(
            "h-12 w-32 animate-pulse rounded-md bg-ink/10 md:h-14",
            className,
          )}
          aria-label={retailer.name}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={retailer.name}
        data-testid={`brand-logo-${retailer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
        onLoad={() => setState("loaded")}
        onError={() => setState("fallback")}
        loading="lazy"
        className={cn(
          "block max-h-16 max-w-[180px] object-contain object-left transition-opacity duration-300 md:max-h-20 md:max-w-[200px]",
          state === "loaded" ? "opacity-100" : "absolute opacity-0",
          className,
        )}
      />
    </div>
  );
}

