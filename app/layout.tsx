import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Restocking — Alertes restock taille-spécifiques",
  description:
    "Colle l'URL, choisis ta taille — on t'alerte avant que ce soit reparti. Alertes de retour en stock pour Zara, COS, Uniqlo, Aritzia, Mango, Sézane.",
  keywords: [
    "restock",
    "alerte stock",
    "zara",
    "cos",
    "uniqlo",
    "aritzia",
    "mango",
    "sézane",
  ],
  openGraph: {
    title: "Restocking — Alertes restock taille-spécifiques",
    description:
      "Colle l'URL, choisis ta taille — on t'alerte avant que ce soit reparti.",
    siteName: "Restocking",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
