import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { SignupForm } from "./signup-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SignupHeading } from "./signup-heading";

export default function SignupPage() {
  const isConfigured = isSupabaseConfigured();
  return (
    <main
      data-testid="signup-page"
      className="relative min-h-[80dvh] overflow-hidden"
    >
      <div className="dot-paper pointer-events-none absolute inset-0" aria-hidden />
      <div className="container relative mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:py-20">
        <aside className="relative">
          <SignupHeading />
          <div className="pointer-events-none absolute -right-6 -top-6 hidden lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://static.prod-images.emergentagent.com/jobs/40fdc8e3-cfec-4df7-8e98-e85f89d6fe27/images/900cf514768684e136ea91a398eefac18ad6e9aa5d094d05f3780a8e1cb11a73.png"
              alt=""
              className="stamp-spin h-24 w-24 drop-shadow-[2px_2px_0_var(--ink)]"
            />
          </div>
        </aside>

        <section className="relative">
          <div className="absolute -right-4 -top-6 hidden h-20 w-20 -rotate-6 rounded-2xl border-2 border-ink bg-[var(--brand-lime)] md:block" />
          <div className="relative rounded-3xl border-2 border-ink bg-paper p-7 shadow-brutal-xl md:p-9">
            <div
              data-testid="signup-back-home"
              className="mb-7 inline-block"
            >
              <Logo size="md" />
            </div>
            <SignupForm isAuthConfigured={isConfigured} />
          </div>
        </section>
      </div>
    </main>
  );
}
