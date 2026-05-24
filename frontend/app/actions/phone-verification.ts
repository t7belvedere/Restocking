"use server";

const WORKER_URL =
  process.env.VERCEL_ENV === "production"
    ? "https://restocking-production.up.railway.app"
    : process.env.WORKER_API_URL || "https://restocking-production.up.railway.app";

export async function sendPhoneOtp(phone: string): Promise<{ ok: boolean; error?: string }> {
  if (!phone || !/^\+[0-9]{7,15}$/.test(phone)) {
    return { ok: false, error: "Numéro invalide. Format : +33612345678" };
  }

  try {
    const url = new URL("/send-otp", WORKER_URL);
    url.searchParams.set("phone", phone);
    const res = await fetch(url.toString(), { method: "POST" });
    if (!res.ok) {
      if (res.status === 429) return { ok: false, error: "Attends 60 secondes avant de réessayer." };
      return { ok: false, error: "Impossible d'envoyer le SMS. Réessaie plus tard." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Erreur réseau. Réessaie dans un instant." };
  }
}

export async function verifyPhoneOtp(
  phone: string,
  code: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!phone || !code || code.length !== 6) {
    return { ok: false, error: "Code invalide." };
  }

  try {
    const url = new URL("/verify-otp", WORKER_URL);
    url.searchParams.set("phone", phone);
    url.searchParams.set("code", code);
    const res = await fetch(url.toString(), { method: "POST" });
    if (!res.ok) {
      if (res.status === 403) return { ok: false, error: "Code incorrect." };
      if (res.status === 410) return { ok: false, error: "Code expiré. Demande un nouveau code." };
      return { ok: false, error: "Vérification échouée." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Erreur réseau." };
  }
}
