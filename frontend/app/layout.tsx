import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  DM_Sans,
  DM_Mono,
  Italiana,
  Playfair_Display,
  Anton,
} from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { LocaleProvider } from "@/components/site/locale-provider";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { OrganizationJsonLd } from "@/components/site/json-ld";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const italiana = Italiana({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-italiana",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "restocking — alertes de retour en stock, taille par taille",
    template: "%s — restocking",
  },
  description:
    "Restocking surveille les boutiques mode européennes (Zara, COS, Aritzia, Sézane, Uniqlo…) et te prévient en moins de 5 minutes dès que ta taille revient en stock.",
  metadataBase: new URL("https://www.restocking.app"),
  alternates: {
    canonical: "https://www.restocking.app",
    languages: {
      fr: "https://www.restocking.app",
      en: "https://www.restocking.app/en",
    },
  },
  openGraph: {
    title: "restocking — your size, the moment it comes back",
    description:
      "Size-specific restock alerts for European fashion. Zara, COS, Aritzia, Sézane and 100+ stores.",
    url: "https://www.restocking.app",
    siteName: "restocking",
    type: "website",
    images: [
      {
        url: "https://www.restocking.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "restocking — alertes de retour en stock",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "restocking — your size, the moment it comes back",
    description:
      "Size-specific restock alerts for European fashion. Zara, COS, Aritzia, Sézane and 100+ stores.",
    images: ["https://www.restocking.app/og-image.png"],
  },
};

async function getAuthState(): Promise<boolean> {
  try {
    const supabase = await createClient();
    if (!supabase) return false;
    const { data } = await supabase.auth.getClaims();
    return Boolean(data?.claims?.sub);
  } catch {
    return false;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await getAuthState();

  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${bricolage.variable} ${dmSans.variable} ${dmMono.variable} ${italiana.variable} ${playfair.variable} ${anton.variable}`}
    >
      <body className="min-h-dvh bg-cream text-ink antialiased">
        <OrganizationJsonLd />
        <LocaleProvider>
          <SiteHeader isAuthenticated={isAuthenticated} />
          {children}
          <SiteFooter />
          <Toaster />
        </LocaleProvider>
      </body>
    </html>
  );
}
