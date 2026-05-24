import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comment ça marche",
  description:
    "Trois étapes pour ne plus jamais rater ta taille. Colle l'URL d'un produit, choisis ta taille, reçois l'alerte en moins de 5 minutes.",
  alternates: {
    canonical: "https://www.restocking.app/how-it-works",
    languages: {
      fr: "https://www.restocking.app/how-it-works",
      en: "https://www.restocking.app/en/how-it-works",
    },
  },
  openGraph: { title: "Comment ça marche — restocking" },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
