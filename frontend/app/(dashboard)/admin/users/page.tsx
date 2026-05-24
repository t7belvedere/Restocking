import { createAdminClient } from "@/lib/supabase/server";
import { deleteUserAction } from "@/app/actions/user-admin";
import { revalidatePath } from "next/cache";

export default async function UsersAdminPage() {
  const adminClient = createAdminClient();

  if (!adminClient) {
    return (
      <div className="rounded-md border-2 border-red-500 bg-red-50 p-4">
        <h2 className="font-bold text-red-700">Service Role Manquant</h2>
        <p className="text-sm text-red-600">
          Vous devez configurer <code>SUPABASE_SERVICE_ROLE_KEY</code> dans vos variables d'environnement
          pour gérer les utilisateurs.
        </p>
      </div>
    );
  }

  const { data: { users }, error } = await adminClient.auth.admin.listUsers();

  if (error) {
    return (
      <div className="rounded-md border-2 border-red-500 bg-red-50 p-4">
        <h2 className="font-bold text-red-700">Erreur lors de la récupération</h2>
        <p className="text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-bold">Utilisateurs ({users.length})</h2>
      <table className="w-full border-2 border-ink bg-cream text-left">
        <thead className="bg-ink text-cream">
          <tr>
            <th className="p-3">Email</th>
            <th className="p-3">Dernière connexion</th>
            <th className="p-3">Créé le</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((u) => (
            <tr key={u.id} className="border-b border-ink">
              <td className="p-3 font-medium">{u.email}</td>
              <td className="p-3 text-sm">
                {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "Jamais"}
              </td>
              <td className="p-3 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="p-3">
                <form action={async () => {
                  "use server";
                  await deleteUserAction(u.id);
                  revalidatePath("/admin/users");
                }}>
                  <button 
                    type="submit" 
                    className="text-red-500 font-bold hover:underline disabled:opacity-50"
                    disabled={u.email === "th3drata@gmail.com"}
                    title={u.email === "th3drata@gmail.com" ? "Impossible de supprimer l'admin" : "Supprimer cet utilisateur"}
                  >
                    Supprimer
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={4} className="p-6 text-center text-sm">
                Aucun utilisateur inscrit pour le moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
