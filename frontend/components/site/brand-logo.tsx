"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BrandWordmark } from "@/components/site/brand-wordmark";
import type { Retailer } from "@/lib/data/retailers";

type LogoState =
  | { kind: "loading" }
  | { kind: "loaded"; url: string }
  | { kind: "fallback" };

type Props = {
  retailer: Pick<Retailer, "name" | "domain" | "wordmark" | "accent">;
  className?: string;
  wordmarkClassName?: string;
};

/**
 * Renders a retailer logo via our internal API proxy (/api/logo/[domain]).
 * This ensures we get the high-quality wordmark logo from Brandfetch
 * structured data, rather than the default (often just an icon) from their CDN.
 */
export function BrandLogo({ retailer, className, wordmarkClassName }: Props) {
  const [state, setState] = useState<LogoState>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(`/api/logo/${retailer.domain}`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        
        if (!active) return;
        
        if (data.url) {
          setState({ kind: "loaded", url: data.url });
        } else {
          setState({ kind: "fallback" });
        }
      } catch (err) {
        if (active) setState({ kind: "fallback" });
      }
    }
    load();
    return () => { active = false; };
  }, [retailer.domain]);

  if (state.kind === "fallback") {
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
      {state.kind === "loading" && (
        <div
          data-testid={`brand-logo-skeleton-${retailer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
          className={cn(
            "h-12 w-32 animate-pulse rounded-md bg-ink/10 md:h-14",
            className,
          )}
          aria-label={retailer.name}
        />
      )}
      {state.kind === "loaded" && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={state.url}
          alt={retailer.name}
          data-testid={`brand-logo-${retailer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
          loading="lazy"
          className={cn(
            "block max-h-12 max-w-[150px] object-contain object-left transition-opacity duration-300 md:max-h-16 md:max-w-[180px]",
            className,
          )}        />
      )}
    </div>
  );
}


