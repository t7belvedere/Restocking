import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Allow the Emergent preview proxy host(s) to access Next.js dev resources
  allowedDevOrigins: [
    "38d41397-b1cf-4258-b44b-ea8632fcb75e.preview.emergentagent.com",
    "*.preview.emergentagent.com",
    "*.preview.emergentcf.cloud",
    "*.cluster-5.preview.emergentcf.cloud",
    "restock-radar-1.cluster-5.preview.emergentcf.cloud",
  ],
  // Allow Unsplash & Pexels remote images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "static.prod-images.emergentagent.com" },
      { protocol: "https", hostname: "cdn.brandfetch.io" },
      { protocol: "https", hostname: "assets.brandfetch.io" },
    ],
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  // Permanent redirect: bare domain → www
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "restocking.app" }],
        destination: "https://www.restocking.app/:path*",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
