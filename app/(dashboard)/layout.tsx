import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardNav from "@/components/dashboard/nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: subData } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .single();

  const plan = ((subData as { plan?: string } | null)?.plan ?? "free");

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNav user={user} plan={plan} />
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
