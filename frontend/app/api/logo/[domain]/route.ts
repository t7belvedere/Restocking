import { NextRequest, NextResponse } from "next/server";

const BRANDFETCH_API_KEY = process.env.BRANDFETCH_API_KEY;
const CLIENT_ID = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID || "1idoVDqRtZmwOL9NXro";

/**
 * Server-side proxy for Brandfetch Brand API.
 *
 * Tries Brandfetch API v2 first (rich structured data, light-bg preferred),
 * then falls back to the public CDN. Returns null when nothing is found so
 * the frontend can render a typographic wordmark.
 *
 * Cached for 14 days via Next.js fetch revalidation.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> },
) {
  const { domain } = await params;

  const cdnFallback = `https://cdn.brandfetch.io/${domain}?c=${CLIENT_ID}`;

  if (!BRANDFETCH_API_KEY) {
    return NextResponse.json({ url: cdnFallback });
  }

  try {
    const res = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      headers: { Authorization: `Bearer ${BRANDFETCH_API_KEY}` },
      next: { revalidate: 3600 * 24 * 14 },
    });

    if (!res.ok) {
      return NextResponse.json({ url: cdnFallback });
    }

    const data = await res.json();
    const logoAsset =
      data.logos?.find((l: any) => l.type === "logo") || data.logos?.[0];
    const formats: any[] = logoAsset?.formats ?? [];

    // Prefer light-background formats so the logo is visible on our UI.
    const lightFormat = formats.find(
      (f: any) =>
        f.background === "light" || f.background === "transparent",
    );
    const bestUrl = lightFormat?.src || formats[0]?.src;

    if (bestUrl) {
      return NextResponse.json({ url: bestUrl });
    }

    // API returned no usable format → try CDN
    return NextResponse.json({ url: cdnFallback });
  } catch {
    // API unreachable → try CDN
    return NextResponse.json({ url: cdnFallback });
  }
}
