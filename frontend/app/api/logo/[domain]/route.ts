import { NextRequest, NextResponse } from "next/server";

const BRANDFETCH_API_KEY = process.env.BRANDFETCH_API_KEY;

/**
 * Server-side proxy for Brandfetch Brand API.
 * 
 * We use this to get high-quality assets (logos, not icons) that aren't
 * easily accessible via the public CDN without the API's structured response.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain } = await params;
  
  // Public Client ID for CDN fallback
  const CLIENT_ID = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID || "1idoVDqRtZmwOL9NXro";
  const cdnFallback = `https://cdn.brandfetch.io/${domain}?c=${CLIENT_ID}`;

  if (!BRANDFETCH_API_KEY) {
    // If no API key, return the CDN URL directly
    return NextResponse.json({ url: cdnFallback });
  }

  try {
    const res = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      headers: {
        Authorization: `Bearer ${BRANDFETCH_API_KEY}`,
      },
      next: { revalidate: 3600 * 24 * 14 },
    });

    if (!res.ok) {
      return NextResponse.json({ url: cdnFallback });
    }

    const data = await res.json();
    
    // 1. Try to find the horizontal wordmark (logo)
    // 2. Try to find the symbol/icon
    // 3. Fallback to CDN URL
    const logoAsset = data.logos?.find((l: any) => l.type === "logo") || data.logos?.[0];
    const bestUrl = logoAsset?.formats?.[0]?.src || cdnFallback;

    return NextResponse.json({ url: bestUrl });
  } catch (error) {
    return NextResponse.json({ url: cdnFallback });
  }
}
