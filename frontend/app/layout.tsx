import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { LocaleProvider } from "@/components/site/locale-provider";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "restocking — alertes de retour en stock, taille par taille",
  description:
    "Restocking surveille les boutiques mode européennes (Zara, COS, Aritzia, Sézane, Uniqlo…) et te prévient en moins de 5 minutes dès que ta taille revient en stock.",
  metadataBase: new URL("https://restocking.app"),
  openGraph: {
    title: "restocking — your size, the moment it comes back",
    description:
      "Size-specific restock alerts for European fashion. Zara, COS, Aritzia, Sézane and 100+ stores.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&family=Italiana&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Anton&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh bg-cream text-ink antialiased">
        <LocaleProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <Toaster />
        </LocaleProvider>
      </body>
    </html>
  );
}
