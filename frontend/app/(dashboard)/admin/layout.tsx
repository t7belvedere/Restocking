import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  if (!supabase) return <div>Auth required</div>;

  const { data: { user } } = await supabase.auth.getUser();
  
  if (user?.email !== "th3drata@gmail.com") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4 border-b-2 border-ink pb-4">
        <h1 className="font-display text-3xl font-bold">Admin</h1>
        <nav className="flex gap-4 ml-auto">
          <Link
            href="/admin/users"
            className="border-2 border-transparent px-4 py-2 font-bold hover:border-ink"
          >
            Utilisateurs
          </Link>
          <Link
            href="/admin/waitlist"
            className="border-2 border-transparent px-4 py-2 font-bold hover:border-ink"
          >
            Waitlist
          </Link>
          <Link
            href="/admin/watches"
            className="border-2 border-transparent px-4 py-2 font-bold hover:border-ink"
          >
            Alertes
          </Link>
        </nav>
      </div>
      <div>{children}</div>
    </div>
  );
}
