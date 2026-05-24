export function formatPrice(
  price: number,
  currency: string = "EUR",
  locale: string = "fr-FR",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(price);
}

export function formatDate(iso: string, locale: string = "fr-FR"): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const RETAILERS = [
  "Zara",
  "COS",
  "Aritzia",
  "Uniqlo",
  "Sézane",
  "Mango",
  "Arket",
  "ASOS",
  "H&M",
  "Massimo Dutti",
  "Pull&Bear",
  "Bershka",
  "Stradivarius",
  "Other Stories",
  "Weekday",
  "Monki",
  "Nike",
  "Adidas",
  "Levi's",
  "Dr. Martens",
] as const;
