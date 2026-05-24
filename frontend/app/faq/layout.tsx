import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Scraping, légalité, délais d'alerte, marques supportées, annulation — toutes les réponses sur le fonctionnement de restocking.",
  alternates: { canonical: "https://www.restocking.app/faq" },
  openGraph: { title: "FAQ — restocking" },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
