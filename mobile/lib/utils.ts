import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number | null | undefined): string {
  if (cents == null) return "—";
  const eur = cents / 100;
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(eur);
}

export function shortHost(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host;
  } catch {
    return url;
  }
}

export function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 10) return "À l'instant";
  if (sec < 60) return `Il y a ${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `Il y a ${min}min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${Math.floor(hours / 24)}j`;
}
