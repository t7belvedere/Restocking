import { NextRequest, NextResponse } from "next/server";

const BRANDFETCH_API_KEY = process.env.BRANDFETCH_API_KEY;
const CLIENT_ID = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID || "1idoVDqRtZmwOL9NXro";

/**
 * Server-side proxy that chains logo providers until one works:
 *  1. Brandfetch API v2 (rich structured data, light-bg format preferred)
 *  2. Simple Icons CDN (SVG, 3000+ brands, black-on-transparent)
 *  3. Returns null → frontend shows typographic wordmark fallback
 *
 * Cached for 14 days via Next.js fetch revalidation.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> },
) {
  const { domain } = await params;

  // ── 1. Brandfetch API ──────────────────────────────────────────
  if (BRANDFETCH_API_KEY) {
    try {
      const res = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
        headers: { Authorization: `Bearer ${BRANDFETCH_API_KEY}` },
        next: { revalidate: 3600 * 24 * 14 },
      });

      if (res.ok) {
        const data = await res.json();
        const logoAsset =
          data.logos?.find((l: any) => l.type === "logo") || data.logos?.[0];
        const formats: any[] = logoAsset?.formats ?? [];

        const lightFormat = formats.find(
          (f: any) =>
            f.background === "light" || f.background === "transparent",
        );
        const bestUrl = lightFormat?.src || formats[0]?.src;
        if (bestUrl) {
          return NextResponse.json({ url: bestUrl });
        }
      }
    } catch {
      // Brandfetch API failed → try next provider
    }
  }

  // ── 2. Simple Icons CDN ─────────────────────────────────────────
  // Derive the Simple Icons slug from the domain's SLD.
  // Simple Icons uses lowercase slugs like "zara", "cos", "acnestudios".
  const slug = domain.replace("www.", "").split(".")[0].toLowerCase();
  const simpleIconsUrl = `https://cdn.simpleicons.org/${slug}/000000`;

  try {
    const check = await fetch(simpleIconsUrl, { method: "HEAD" });
    if (check.ok) {
      return NextResponse.json({ url: simpleIconsUrl });
    }
  } catch {
    // Simple Icons unreachable → return null
  }

  // ── 3. Nothing found ────────────────────────────────────────────
  return NextResponse.json({ url: null });
}
