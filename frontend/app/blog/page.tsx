import Link from "next/link";
import { getLocale } from "next-intl/server";
import { blogPosts } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — restocking",
  description:
    "Conseils, astuces et actualités sur les alertes de retour en stock, la mode européenne et l'automatisation shopping.",
  alternates: {
    canonical: "https://www.restocking.app/blog",
    languages: {
      fr: "https://www.restocking.app/blog",
      en: "https://www.restocking.app/en/blog",
    },
  },
};

export default async function BlogPage() {
  const locale = await getLocale();

  return (
    <main className="container mx-auto max-w-4xl px-5 py-16 lg:px-8">
      <div className="space-y-4 mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink/60">Blog</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tighter text-ink md:text-5xl">
          {locale === "fr"
            ? "Le journal de restocking"
            : "The restocking journal"}
        </h1>
        <p className="text-lg text-ink/70 max-w-2xl">
          {locale === "fr"
            ? "Conseils, astuces et actualités sur les alertes de retour en stock, la mode européenne et l'automatisation de vos achats."
            : "Tips, tricks, and news about restock alerts, European fashion, and shopping automation."}
        </p>
      </div>

      <div className="space-y-8">
        {blogPosts.map((post) => {
          const title = locale === "fr" ? post.title : post.titleEn;
          const description = locale === "fr" ? post.description : post.descriptionEn;
          const href = locale === "fr" ? `/blog/${post.slug}` : `/en/blog/${post.slug}`;

          return (
            <article
              key={post.slug}
              className="border-2 border-ink rounded-xl p-6 bg-paper shadow-brutal-sm hover:shadow-brutal transition-shadow"
            >
              <div className="flex items-center gap-3 text-xs text-ink/50 mb-3">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span aria-hidden="true">·</span>
                <span>{post.author}</span>
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tighter mb-2">
                <Link href={href} className="hover:text-[var(--brand-orange)] transition-colors">
                  {title}
                </Link>
              </h2>
              <p className="text-ink/70 mb-4">{description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block rounded-full border border-ink/20 bg-cream px-2 py-0.5 text-xs font-medium text-ink/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href={href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-orange)] hover:underline"
              >
                {locale === "fr" ? "Lire l'article" : "Read article"} →
              </Link>
            </article>
          );
        })}
      </div>
    </main>
  );
}
