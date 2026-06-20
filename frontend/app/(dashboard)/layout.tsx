import { DashboardNav } from "@/components/dashboard/nav";
import { getSubscription, getCurrentUser } from "@/lib/data/watches";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, subscription] = await Promise.all([
    getCurrentUser(),
    getSubscription(),
  ]);

  return (
    <div className="relative min-h-dvh">
      <div
        aria-hidden
        className="surface-grain pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]"
      />
      <DashboardNav email={user?.email ?? null} plan={subscription?.plan ?? "free"} />
      <div className="container mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">{children}</div>
    </div>
  );
}
