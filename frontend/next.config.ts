import type { NextConfig } from "next";

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
    ],
  },
};

export default nextConfig;
