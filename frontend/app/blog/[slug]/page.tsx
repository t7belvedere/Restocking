import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { messages, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/messages";
import { getPost, getAllSlugs, generatePostMetadata } from "@/lib/blog";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    ...generatePostMetadata(post, "fr"),
    alternates: {
      canonical: `https://www.restocking.app/blog/${slug}`,
      languages: {
        fr: `https://www.restocking.app/blog/${slug}`,
        en: `https://www.restocking.app/en/blog/${slug}`,
      },
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const cookieStore = await cookies();
  const locale = (cookieStore.get("restocking.locale")?.value ?? DEFAULT_LOCALE) as Locale;

  const title = locale === "fr" ? post.title : post.titleEn;
  const description = locale === "fr" ? post.description : post.descriptionEn;
  const content = post.content(locale);

  return (
    <main className="container mx-auto max-w-3xl px-5 py-16 lg:px-8">
      <Link
        href={locale === "fr" ? "/blog" : "/en/blog"}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/50 hover:text-ink transition-colors mb-8"
      >
        ← {locale === "fr" ? "Retour au blog" : "Back to blog"}
      </Link>

      <article>
        <header className="space-y-4 mb-10">
          <div className="flex items-center gap-3 text-sm text-ink/50">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString(
                locale === "fr" ? "fr-FR" : "en-US",
                { year: "numeric", month: "long", day: "numeric" },
              )}
            </time>
            <span aria-hidden="true">·</span>
            <span>{post.author}</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tighter text-ink md:text-5xl">
            {title}
          </h1>
          <p className="text-lg text-ink/70">{description}</p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block rounded-full border border-ink/20 bg-cream px-2.5 py-0.5 text-xs font-medium text-ink/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        </header>

        <div
          className="prose prose-lg max-w-none prose-headings:font-display prose-headings:tracking-tighter prose-a:text-[var(--brand-orange)] prose-a:no-underline hover:prose-a:underline prose-strong:text-ink prose-img:rounded-xl prose-img:border-2 prose-img:border-ink"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      </article>

      <hr className="my-12 border-ink/20" />

      <div className="rounded-xl border-2 border-ink bg-[var(--brand-lime)]/20 p-6 text-center">
        <p className="font-display text-lg font-bold mb-2">
          {locale === "fr"
            ? "Prête à ne plus jamais rater ta taille ?"
            : "Ready to never miss your size again?"}
        </p>
        <p className="text-sm text-ink/70 mb-4">
          {locale === "fr"
            ? "Crée un compte gratuit et active tes 3 premières alertes."
            : "Create a free account and activate your first 3 alerts."}
        </p>
        <Link
          href="/signup"
          className="inline-flex h-11 items-center rounded-full border-2 border-ink bg-ink px-5 font-display text-sm font-bold uppercase tracking-wide text-cream shadow-brutal hover-press"
        >
          {locale === "fr" ? "Commencer gratuitement" : "Start for free"}
        </Link>
      </div>
    </main>
  );
}

function renderMarkdown(text: string): string {
  let html = text
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[^<]*<\/li>)/g, "<ul>$1</ul>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  html = "<p>" + html + "</p>";
  return html;
}
