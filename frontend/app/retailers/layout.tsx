import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marques surveillées",
  description:
    "Zara, COS, Aritzia, Sézane, Uniqlo et 120+ boutiques mode européennes. Restocking fonctionne avec n'importe quelle URL — ces marques sont optimisées pour une précision maximale.",
  alternates: {
    canonical: "https://www.restocking.app/retailers",
    languages: {
      fr: "https://www.restocking.app/retailers",
      en: "https://www.restocking.app/en/retailers",
    },
  },
  openGraph: { title: "Marques surveillées — restocking" },
};

export default function RetailersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
