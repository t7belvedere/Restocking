"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BrandWordmark } from "@/components/site/brand-wordmark";
import type { Retailer } from "@/lib/data/retailers";

const BRANDFETCH_CLIENT_ID =
  process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID ?? "";

/**
 * Builds the Brandfetch CDN URL for a brand's official logo.
 * Doc: https://docs.brandfetch.com/docs/logo-link
 *
 * The "c" param is the public clientId — safe to expose in the browser.
 * We omit fallback=lettermark/transparent so Brandfetch picks the cleanest
 * variant per brand (usually a wordmark over transparent bg).
 */
function brandfetchUrl(domain: string): string | null {
  if (!BRANDFETCH_CLIENT_ID) return null;
  return `https://cdn.brandfetch.io/${domain}/w/400/h/200?c=${BRANDFETCH_CLIENT_ID}`;
}

type Props = {
  retailer: Pick<Retailer, "name" | "domain" | "wordmark" | "accent">;
  className?: string;
  wordmarkClassName?: string;
};

/**
 * Renders a retailer logo.
 *
 *  1. Tries the official Brandfetch logo (CDN, no auth other than public clientId)
 *  2. On <img> error (404, network, quota) we fall back to our hand-tuned
 *     typographic wordmark so the tile never breaks.
 *
 * The <img> is rendered with no width/height to preserve the SVG aspect; the
 * parent tile constrains it.
 */
export function BrandLogo({ retailer, className, wordmarkClassName }: Props) {
  const [errored, setErrored] = useState(false);
  const url = brandfetchUrl(retailer.domain);

  if (!url || errored) {
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
      src={url}
      alt={retailer.name}
      data-testid={`brand-logo-${retailer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
      onError={() => setErrored(true)}
      loading="lazy"
      className={cn(
        "block max-h-12 max-w-[140px] object-contain object-left md:max-h-14",
        className,
      )}
    />
  );
}
