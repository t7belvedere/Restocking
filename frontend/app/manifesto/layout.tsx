import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "On en a marre de checker. Restocking, c'est l'outil qu'on aurait voulu pour soi. Une URL, une taille, un ping. Pas plus.",
  alternates: { canonical: "https://www.restocking.app/manifesto" },
  openGraph: { title: "Manifesto — restocking" },
};

export default function ManifestoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
