import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/site/logo";
import { LoginForm } from "./login-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginHeading } from "./login-heading";

export default function LoginPage() {
  const isConfigured = isSupabaseConfigured();
  return (
    <main
      data-testid="login-page"
      className="relative min-h-[80dvh] overflow-hidden"
    >
      <div className="dot-paper pointer-events-none absolute inset-0" aria-hidden />
      <div className="container relative mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:py-20">
        <aside className="relative">
          <LoginHeading />
          <div className="pointer-events-none absolute -right-6 -top-6 hidden lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://static.prod-images.emergentagent.com/jobs/40fdc8e3-cfec-4df7-8e98-e85f89d6fe27/images/335f73b191dda7303f3dcf89714450cbe0ab04c564577914ae2f9965b771d903.png"
              alt=""
              className="stamp-spin h-24 w-24 drop-shadow-[2px_2px_0_var(--ink)]"
            />
          </div>
        </aside>

        <section className="relative">
          <div className="absolute -left-6 -top-6 hidden h-20 w-20 rotate-12 rounded-2xl border-2 border-ink bg-[var(--brand-blue)] md:block" />
          <div className="relative rounded-3xl border-2 border-ink bg-paper p-7 shadow-brutal-xl md:p-9">
            <div data-testid="login-back-home" className="mb-7">
              <Logo size="md" />
            </div>
            <Suspense
              fallback={
                <div className="h-64 animate-pulse rounded-xl border-2 border-ink/15 bg-cream" />
              }
            >
              <LoginForm isAuthConfigured={isConfigured} />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
