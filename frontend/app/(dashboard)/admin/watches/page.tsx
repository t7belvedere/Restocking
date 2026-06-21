import { getAllWatches, toggleWatch, deleteWatch } from "@/app/actions/watches-admin";
import { createAdminClient } from "@/lib/supabase/server";
import { formatPrice, shortHost } from "@/lib/utils";

function statusLabel(s: string | null, active: boolean) {
  if (!active) return "⏸ En pause";
  if (s === "IN_STOCK") return "🟢 En stock";
  if (s === "OUT_OF_STOCK") return "🔴 Rupture";
  return "⏳ Inconnu";
}

export default async function WatchesAdminPage() {
  const watches = await getAllWatches();

  // Batch-resolve user emails via admin API
  const userIds = [...new Set(watches.map((w) => w.user_id))];
  const emailMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const adminClient = createAdminClient();
    if (adminClient) {
      for (const uid of userIds) {
        try {
          const { data } = await adminClient.auth.admin.getUserById(uid);
          if (data?.user?.email) {
            emailMap[uid] = data.user.email;
          }
        } catch {
          emailMap[uid] = uid.slice(0, 8) + "…";
        }
      }
    }
  }

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-bold">
        Alertes ({watches.length})
      </h2>

      {watches.length === 0 ? (
        <p className="text-sm text-ink/50">Aucune alerte créée.</p>
      ) : (
        <div className="overflow-x-auto border-2 border-ink">
          <table className="w-full text-left">
            <thead className="bg-ink text-cream">
              <tr>
                <th className="p-3 text-xs uppercase">Produit</th>
                <th className="p-3 text-xs uppercase">Utilisateur</th>
                <th className="p-3 text-xs uppercase">URL</th>
                <th className="p-3 text-xs uppercase">Variante</th>
                <th className="p-3 text-xs uppercase">Prix</th>
                <th className="p-3 text-xs uppercase">Statut</th>
                <th className="p-3 text-xs uppercase">Dernier check</th>
                <th className="p-3 text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {watches.map((w) => (
                <tr key={w.id} className="border-b border-ink/20 text-sm">
                  <td className="p-3 font-medium max-w-[200px] truncate" title={w.name ?? ""}>
                    {w.name ?? "—"}
                  </td>
                  <td className="p-3 text-xs">
                    {emailMap[w.user_id] ?? w.user_id.slice(0, 8) + "…"}
                  </td>
                  <td className="p-3">
                    <a
                      href={w.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--brand-blue)] hover:underline text-xs"
                    >
                      {shortHost(w.url)}
                    </a>
                  </td>
                  <td className="p-3 text-xs">{w.variant_label ?? "—"}</td>
                  <td className="p-3 font-mono text-xs">{formatPrice(w.price)}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-ink/20 px-2 py-0.5 text-[10px] font-bold uppercase">
                      {statusLabel(w.last_status, w.is_active)}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-ink/50">
                    {w.last_check
                      ? new Date(w.last_check).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Jamais"}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <form action={async () => {
                        "use server";
                        await toggleWatch(w.id, !w.is_active);
                      }}>
                        <button
                          type="submit"
                          className="text-xs font-bold border border-ink px-2 py-1 rounded hover:bg-ink hover:text-cream"
                        >
                          {w.is_active ? "Pause" : "Activer"}
                        </button>
                      </form>
                      <form action={async () => {
                        "use server";
                        await deleteWatch(w.id);
                      }}>
                        <button
                          type="submit"
                          className="text-xs font-bold text-red-500 border border-red-300 px-2 py-1 rounded hover:bg-red-500 hover:text-white"
                        >
                          Supprimer
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
