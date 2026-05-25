"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
 * Caches the result in localStorage to prevent redundant API calls.
 */
export function BrandLogo({ retailer, className, wordmarkClassName }: Props) {
  const [state, setState] = useState<LogoState>({ kind: "loading" });

  useEffect(() => {
    const cacheKey = `logo_${retailer.domain}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      setState({ kind: "loaded", url: cached });
      return;
    }

    let active = true;
    async function load() {
      try {
        const res = await fetch(`/api/logo/${retailer.domain}`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        
        if (!active) return;
        
        if (data.url) {
          localStorage.setItem(cacheKey, data.url);
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

  const testId = retailer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div
      className={cn(
        "relative h-12 w-full max-w-[160px] md:h-14 md:max-w-[190px]",
        className,
      )}
    >
      {state.kind === "loading" && (
        <div
          data-testid={`brand-logo-skeleton-${testId}`}
          className="h-full w-full animate-pulse rounded-md bg-ink/10"
          aria-label={retailer.name}
        />
      )}
      {state.kind === "loaded" && (
        <Image
          src={state.url}
          alt={retailer.name}
          data-testid={`brand-logo-${testId}`}
          fill
          sizes="(min-width: 1024px) 190px, (min-width: 768px) 160px, (min-width: 640px) 140px, 50vw"
          className="object-contain object-left transition-opacity duration-300"
          unoptimized={state.url.includes("brandfetch.io")}
        />
      )}
    </div>
  );
}


