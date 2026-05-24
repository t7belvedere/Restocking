export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.restocking.app/#organization",
        name: "restocking",
        url: "https://www.restocking.app",
        logo: "https://www.restocking.app/icon.svg",
        description:
          "Alertes de retour en stock, taille par taille pour la mode européenne.",
        email: "hello@restocking.app",
        sameAs: [
          "https://twitter.com/restockingapp",
          "https://instagram.com/restocking.app",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://www.restocking.app/#website",
        url: "https://www.restocking.app",
        name: "restocking",
        description:
          "Alertes de retour en stock, taille par taille pour la mode européenne.",
        publisher: { "@id": "https://www.restocking.app/#organization" },
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://www.restocking.app/#softwareapplication",
        name: "restocking",
        url: "https://www.restocking.app",
        description:
          "Surveille les retours en stock taille par taille sur Zara, COS, Aritzia, Sézane, Uniqlo et 100+ marques européennes. Notification en moins de 5 minutes.",
        applicationCategory: "WebApplication",
        operatingSystem: "All",
        inLanguage: ["fr", "en"],
        offers: {
          "@type": "AggregateOffer",
          lowPrice: "0",
          highPrice: "59",
          priceCurrency: "EUR",
          offerCount: 2,
        },
        author: { "@id": "https://www.restocking.app/#organization" },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function FaqJsonLd({
  questions,
}: {
  questions: { q: string; a: string }[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
