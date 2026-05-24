import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Gratuit pour commencer (3 produits), Pro à 59€/an pour les vrais chasseurs (20 produits, alertes SMS, vérification toutes les 5 minutes).",
  alternates: {
    canonical: "https://www.restocking.app/pricing",
    languages: {
      fr: "https://www.restocking.app/pricing",
      en: "https://www.restocking.app/en/pricing",
    },
  },
  openGraph: { title: "Tarifs — restocking" },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
