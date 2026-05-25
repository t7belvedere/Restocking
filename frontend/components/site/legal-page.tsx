"use client";

import { useMessages } from "next-intl";
import { Sparkles } from "lucide-react";

type LegalPageProps = {
  type: "privacy" | "terms" | "cookies" | "mentionsLegales";
};

export function LegalPage({ type }: LegalPageProps) {
  const t = useMessages();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = (t as any).legal[type];

  return (
    <main className="min-h-screen bg-paper py-20 lg:py-32">
      <div className="container mx-auto max-w-4xl px-6">
        {/* HEADER */}
        <header className="mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-cream px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] shadow-brutal-sm">
            <Sparkles className="h-3.5 w-3.5 text-[var(--brand-lime)]" />
            Légal
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tighter md:text-6xl">
            {content.title}
          </h1>
          <p className="mt-4 font-mono text-sm font-bold uppercase tracking-widest text-ink/40">
            {content.lastUpdated}
          </p>
        </header>

        {/* CONTENT */}
        <div className="space-y-12">
          <div className="rounded-3xl border-2 border-ink bg-cream p-8 shadow-brutal md:p-10">
            <p className="text-xl font-medium leading-relaxed md:text-2xl">
              {content.intro}
            </p>
          </div>

          <div className="grid gap-8">
            {content.sections.map((section: { title: string; content: string }, i: number) => (
              <section
                key={i}
                className="group rounded-3xl border-2 border-ink bg-paper p-8 transition-colors hover:bg-cream/50"
              >
                <div className="mb-4 flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-ink font-display text-sm font-bold text-cream shadow-brutal-sm">
                    {i + 1}
                  </span>
                  <h2 className="font-display text-2xl font-extrabold tracking-tight">
                    {section.title}
                  </h2>
                </div>
                <p className="text-lg leading-relaxed text-ink/70">
                  {section.content}
                </p>
              </section>
            ))}
          </div>
        </div>

        {/* FOOTER NOTE */}
        <footer className="mt-20 border-t-2 border-ink/10 pt-10">
          <p className="text-center text-sm font-medium text-ink/40">
            Questions ? Écris-nous sur hello@restocking.app
          </p>
        </footer>
      </div>
    </main>
  );
}
