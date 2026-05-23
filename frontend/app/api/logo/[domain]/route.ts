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

  if (!BRANDFETCH_API_KEY) {
    return NextResponse.json({ url: null }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      headers: {
        Authorization: `Bearer ${BRANDFETCH_API_KEY}`,
      },
      next: { revalidate: 3600 * 24 * 14 }, // Cache for 14 days
    });

    if (!res.ok) {
      return NextResponse.json({ url: null });
    }

    const data = await res.json();
    
    // Pick the best logo (horizontal wordmark preferred)
    // Brandfetch assets usually have 'logo', 'icon', 'symbol'
    const logoAsset = data.logos?.find((l: any) => l.type === "logo") || data.logos?.[0];
    
    if (!logoAsset || !logoAsset.formats?.[0]?.src) {
      return NextResponse.json({ url: null });
    }

    // Return the CDN URL for the logo format
    return NextResponse.json({ url: logoAsset.formats[0].src });
  } catch (error) {
    console.error(`Brandfetch API error for ${domain}:`, error);
    return NextResponse.json({ url: null });
  }
}
