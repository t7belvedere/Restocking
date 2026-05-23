import { getWatches } from "@/lib/data/watches";
import { createClient } from "@/lib/supabase/server";
import { deleteWaitlistEntry } from "@/app/actions/waitlist-admin";
import { revalidatePath } from "next/cache";

export default async function WaitlistAdminPage() {
  const supabase = await createClient();
  if (!supabase) return <div>Auth required</div>;

  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email !== "th3drata@gmail.com") {
    return <div className="container mx-auto py-10">Accès refusé</div>;
  }

  const { data: waitlist } = await supabase
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false });

  async function handleDelete(email: string) {
    "use server";
    await deleteWaitlistEntry(email);
    revalidatePath("/admin/waitlist");
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 font-display text-2xl font-bold">Administration Waitlist</h1>
      <table className="w-full border-2 border-ink">
        <thead className="bg-ink text-cream">
          <tr>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {waitlist?.map((entry) => (
            <tr key={entry.id} className="border-b border-ink">
              <td className="p-3">{entry.email}</td>
              <td className="p-3">{new Date(entry.created_at).toLocaleDateString()}</td>
              <td className="p-3">
                <form action={async () => {
                  "use server";
                  await deleteWaitlistEntry(entry.email);
                  revalidatePath("/admin/waitlist");
                }}>
                  <button type="submit" className="text-red-500 font-bold hover:underline">
                    Supprimer
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
