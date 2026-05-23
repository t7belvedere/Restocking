import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  href?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
};

const sizeMap = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

/**
 * Wordmark logo "restocking" with a graphic dot motif over the second "o"
 * that doubles as the restock "ping" / notification bubble.
 */
export function Logo({
  className,
  href = "/",
  textClassName,
  size = "md",
  inverted = false,
}: LogoProps) {
  const Comp: React.ElementType = href ? Link : "div";
  const props = href ? { href } : {};
  return (
    <Comp
      {...props}
      className={cn(
        "inline-flex items-baseline gap-0.5 font-display font-extrabold tracking-tight",
        sizeMap[size],
        inverted ? "text-cream" : "text-ink",
        className,
      )}
      data-testid="site-logo"
    >
      <span aria-hidden className="relative inline-block">
        <span>rest</span>
      </span>
      <span aria-hidden className="relative inline-block">
        <span>o</span>
        <span
          className="absolute -top-1.5 right-0.5 inline-block size-2 rounded-full bg-[var(--brand-orange)] ring-2 ring-[var(--ink)]"
          aria-hidden
        />
      </span>
      <span aria-hidden>cking</span>
      <span className="sr-only" data-testid="logo-text">
        restocking
      </span>
      <span
        aria-hidden
        className={cn(
          "ml-1 inline-block translate-y-[-0.05em] font-display font-black",
          size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl",
          "text-[var(--brand-orange)]",
          textClassName,
        )}
      >
        .
      </span>
    </Comp>
  );
}
