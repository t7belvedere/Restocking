"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BrandWordmark } from "@/components/site/brand-wordmark";
import type { Retailer } from "@/lib/data/retailers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

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
 * Renders a retailer logo via our backend logo proxy
 * (GET /api/logo/{domain}) which calls Brandfetch with a server-side key
 * and caches the returned CDN URL in Mongo for 14 days.
 *
 * On any failure (network, no logo found, image load error) we degrade to a
 * typographic wordmark — the tile never breaks.
 */
export function BrandLogo({ retailer, className, wordmarkClassName }: Props) {
  const [state, setState] = useState<LogoState>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/logo/${encodeURIComponent(retailer.domain)}`,
          { cache: "force-cache" },
        );
        if (!res.ok) throw new Error(`logo lookup failed: ${res.status}`);
        const data = (await res.json()) as { url: string | null };
        if (!active) return;
        if (data.url) {
          setState({ kind: "loaded", url: data.url });
        } else {
          setState({ kind: "fallback" });
        }
      } catch {
        if (active) setState({ kind: "fallback" });
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [retailer.domain]);

  if (state.kind === "loading") {
    // Skeleton placeholder keeps tile height stable until the image arrives.
    return (
      <div
        data-testid={`brand-logo-skeleton-${retailer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
        className={cn(
          "h-12 w-32 animate-pulse rounded-md bg-ink/10 md:h-14",
          className,
        )}
        aria-label={retailer.name}
      />
    );
  }

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
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={state.url}
      alt={retailer.name}
      data-testid={`brand-logo-${retailer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
      onError={() => setState({ kind: "fallback" })}
      loading="lazy"
      className={cn(
        "block max-h-12 max-w-[160px] object-contain object-left md:max-h-14",
        className,
      )}
    />
  );
}
