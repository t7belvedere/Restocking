import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/nav";
import { getSubscription, getCurrentUser } from "@/lib/data/watches";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const subscription = await getSubscription();

  return (
    <div className="relative min-h-dvh">
      <div
        aria-hidden
        className="surface-grain pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]"
      />
      <DashboardNav email={user.email ?? null} plan={subscription.plan} />
      <div className="container mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}
