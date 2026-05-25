import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/blog";

const PAGES = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "/how-it-works", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/pricing", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/manifesto", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/retailers", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/mentions-legales", priority: 0.3, changeFrequency: "yearly" as const },
];

function getBlogSlugs(): string[] {
  try {
    return getAllSlugs();
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.restocking.app";
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const page of PAGES) {
    // French (default, no prefix)
    entries.push({
      url: `${baseUrl}${page.path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
    // English (with /en prefix)
    entries.push({
      url: `${baseUrl}/en${page.path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  }

  // Blog posts
  const blogSlugs = getBlogSlugs();
  for (const slug of blogSlugs) {
    entries.push({
      url: `${baseUrl}/blog/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    });
    entries.push({
      url: `${baseUrl}/en/blog/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    });
  }

  return entries;
}
