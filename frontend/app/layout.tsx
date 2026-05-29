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
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { OrganizationJsonLd } from "@/components/site/json-ld";
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
      es: "https://www.restocking.app/es",
      de: "https://www.restocking.app/de",
      it: "https://www.restocking.app/it",
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
        url: "https://www.restocking.app/opengraph-image",
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
    images: ["https://www.restocking.app/opengraph-image"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const isAuthenticated = false;

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${bricolage.variable} ${dmSans.variable} ${dmMono.variable} ${italiana.variable} ${playfair.variable} ${anton.variable}`}
    >
      <body className="min-h-dvh bg-cream text-ink antialiased">
        <OrganizationJsonLd />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <SiteHeader isAuthenticated={isAuthenticated} />
          {children}
          <SiteFooter />
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
