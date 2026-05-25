import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID || "1idoVDqRtZmwOL9NXro";

/**
 * Returns the Brandfetch CDN logo URL for a domain.
 *
 * Brandfetch CDN requires a Referer header (sent by the browser <img> tag),
 * so the Next.js Image component uses `unoptimized` to avoid server-side
 * fetch and let the browser load it directly.
 *
 * We skip the Brandfetch API (v2) entirely to avoid burning through the
 * 100 req/month quota on every page load.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ domain: string }> },
) {
  const { domain } = await params;
  const url = `https://cdn.brandfetch.io/${domain}?c=${CLIENT_ID}`;
  return NextResponse.json({ url });
}
