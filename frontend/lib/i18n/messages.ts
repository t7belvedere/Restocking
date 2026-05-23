export type Locale = "fr" | "en";

export const LOCALES: Locale[] = ["fr", "en"];
export const DEFAULT_LOCALE: Locale = "fr";

export const messages = {
  fr: {
    nav: {
      home: "Accueil",
      how: "Comment ça marche",
      retailers: "Marques",
      pricing: "Tarifs",
      faq: "FAQ",
      manifesto: "Manifesto",
      cta: "Rejoindre la liste",
    },
    common: {
      backHome: "Retour à l’accueil",
      waitlist: "Liste d’attente",
      joinWaitlist: "Rejoindre la liste",
      joining: "On t’inscrit…",
      yourEmail: "Ton e-mail",
      placeholder: "marine@exemple.fr",
      success: "Bienvenue dans la liste 🎉",
      already: "Tu es déjà sur la liste — on te garde une place 💌",
      invalid: "Adresse e-mail invalide.",
      error: "Oups, réessaie dans un instant.",
      counterPre: "déjà",
      counterPost: "fashion victims™ qui attendent",
      counterFallback: "Sois parmi les premiers à débloquer la chasse au stock.",
      privacy: "Pas de spam. On t’écrit uniquement pour t’annoncer le lancement.",
      free: "Gratuit",
      pro: "Pro",
      mostPopular: "Le préféré 🔥",
      perMonth: "/ mois",
      perYear: "/ an",
      monthly: "Mensuel",
      annual: "Annuel",
      saveBadge: "Économise 30%",
      restocked: "EN STOCK",
      soldOut: "ÉPUISÉ",
    },
    home: {
      eyebrow: "Alertes restock par taille · Europe",
      h1Top: "Ta taille,",
      h1Mid: "pile",
      h1Bot: "quand elle revient.",
      sub:
        "Restocking surveille Zara, COS, Aritzia, Sézane, Uniqlo et 100 autres marques. On te ping en moins de 5 minutes dès que ta taille repasse en stock — sans ouvrir 12 onglets, sans se lever la nuit.",
      ctaPrimary: "Je veux mes alertes",
      ctaSecondary: "Voir comment ça marche",
      proofTitle: "Une vraie douleur, documentée par les usagers",
      proofItems: [
        {
          quote:
            "Je check Aritzia 30 fois par jour. La fois où c’est revenu en stock, j’ai raté ma taille en 4 minutes.",
          author: "u/sara_lovesoutfits",
          source: "r/Aritzia",
        },
        {
          quote:
            "L’alerte officielle de Zara m’est arrivée 3 jours après le restock. C’est presque vexant.",
          author: "Camille, 28 ans",
          source: "Paris",
        },
        {
          quote:
            "Je mettais des alarmes la nuit pour checker COS. Restocking m’a sauvé mon dimanche.",
          author: "Tom, 26 ans",
          source: "Berlin",
        },
        {
          quote:
            "Honnêtement Distill et compagnie c’est de la galère, on ne peut pas filtrer par taille.",
          author: "u/dropwatcher",
          source: "r/femalefashionadvice",
        },
      ],
      stats: [
        { value: "<5 min", label: "Délai moyen d’alerte (Pro)" },
        { value: "120+", label: "Marques surveillées" },
        { value: "EU 34–50", label: "Toutes les tailles" },
        { value: "0", label: "Faux positifs aigus, grâce au double check" },
      ],
      bigCtaTitle: "Le moment où ta taille revient, c’est nous qui te le dirons.",
      bigCtaSub:
        "Inscris-toi à la liste d’attente. Tu reçois ton accès dès l’ouverture, et 3 mois de Pro gratuits si tu fais partie des 100 premiers.",
    },
    how: {
      eyebrow: "Comment ça marche",
      title: "Trois étapes. Zéro CSS selector.",
      sub:
        "On a conçu Restocking pour ta sœur qui ne sait pas ce qu’est un domaine. Tu colles l’URL, tu choisis ta taille, on s’occupe du reste.",
      steps: [
        {
          n: "01",
          title: "Colle l’URL du produit",
          body:
            "Copie l’adresse du produit que tu vises (Zara, COS, Sézane…). Restocking récupère automatiquement le nom, la photo, le prix et toutes les variantes disponibles.",
          pill: "1 collage = 1 alerte armée",
        },
        {
          n: "02",
          title: "Choisis ta taille (et ta couleur)",
          body:
            "Sélectionne visuellement TA variante exacte — taille EU 36, coloris bleu marine, longueur regular. On ne te ping pas pour autre chose.",
          pill: "Surveillance par variante",
        },
        {
          n: "03",
          title: "Reçois l’alerte en moins de 5 min",
          body:
            "Email instantané (et SMS pour le plan Pro) dès que le stock revient. Avec le lien direct sur la fiche produit pré-remplie à ta taille.",
          pill: "Plus rapide que les alertes natives",
        },
      ],
      detailsTitle: "Sous le capot",
      details: [
        {
          title: "Détection à 4 étages",
          body:
            "On lit le dataLayer e-commerce, l’état du bouton « Ajouter au panier » et les attributs de variante. Playwright en fallback pour les SPAs récalcitrantes.",
        },
        {
          title: "Double confirmation",
          body:
            "Une variante doit être détectée IN_STOCK deux fois consécutivement pour déclencher l’alerte. Adieu les fausses alertes nocturnes.",
        },
        {
          title: "Respect des retailers",
          body:
            "Lecture publique uniquement, pas de scraping agressif, rotation propre, max 1 requête simultanée par domaine. On joue franc.",
        },
        {
          title: "Hébergé en Europe",
          body:
            "Données stockées en région Frankfurt (Supabase EU), conforme RGPD. Ton e-mail t’appartient.",
        },
      ],
    },
    retailers: {
      eyebrow: "Marques supportées",
      title: "Les boutiques qu’on regarde déjà.",
      sub:
        "Au lancement, on couvre les retailers mid-market européens où les alertes natives sont les plus défaillantes. La liste s’étend chaque semaine.",
      legendInStock: "Couverture solide",
      legendBeta: "En bêta",
      legendSoon: "Bientôt",
      filterAll: "Toutes",
      filterLive: "Live",
      filterBeta: "Bêta",
      filterSoon: "Bientôt",
      tileCta: "Coller une URL",
      requestTitle: "Une marque manque à l’appel ?",
      requestBody:
        "Dis-nous laquelle. On priorise les marques avec le plus de demandes. Plus de 50 votes = ajout sous 2 semaines.",
      requestCta: "Suggérer une marque",
      noResultsTitle: "Rien dans ce filtre, pour l’instant.",
      noResultsBody: "Essaie un autre statut, ou suggère-nous la marque.",
    },
    pricing: {
      eyebrow: "Tarifs",
      title: "Un prix simple. Une vraie différence.",
      sub:
        "Reste sur le Free pour t’essayer. Passe en Pro le jour où tu rates un drop important.",
      toggleMonthly: "Mensuel",
      toggleAnnual: "Annuel · -30%",
      plans: {
        free: {
          name: "Free",
          tagline: "Pour t’essayer.",
          price: "0€",
          unit: "/ pour toujours",
          features: [
            "3 produits surveillés",
            "Check toutes les 30 min",
            "Notifications email",
            "Toutes les marques live",
            "Dashboard temps réel",
          ],
          cta: "Commencer gratuitement",
        },
        pro: {
          name: "Pro",
          tagline: "Pour les vrais chasseurs.",
          priceMonthly: "7,99€",
          priceAnnual: "59€",
          unitMonthly: "/ mois",
          unitAnnual: "/ an · soit 4,90€/mois",
          features: [
            "20 produits surveillés",
            "Check toutes les 5 min · priorité dans la queue",
            "Email + SMS instantanés",
            "Fallback Playwright activé (sites complexes)",
            "Historique de prix + variantes",
            "Support prioritaire",
          ],
          cta: "Passer Pro",
        },
      },
      faqLink: "Des questions sur la facturation ?",
      faqLinkCta: "Voir la FAQ →",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Tout ce qu’on t’aurait demandé.",
      sub:
        "Si une réponse manque, écris-nous directement à hello@restocking.app — on est trois humains derrière.",
      items: [
        {
          q: "Vous faites du scraping sauvage ?",
          a:
            "Non. On lit uniquement des informations publiques (la même page que toi). On respecte les rate limits, on rotate les user-agents proprement, on ne tente jamais de bypass d’authentification, et on n’automatise aucun achat. Position assumée : surveillance publique, pas de revente de données.",
        },
        {
          q: "C’est légal en Europe ?",
          a:
            "Oui. Nous surveillons des prix et disponibilités déjà accessibles publiquement. Aucun contournement de paywall ni d’auth. RGPD : ton e-mail est stocké en région Frankfurt et tu peux le supprimer en un clic.",
        },
        {
          q: "Quel délai entre le restock et la notification ?",
          a:
            "Free : 30 minutes maximum. Pro : moins de 5 minutes (médiane mesurée 2 min 40 lors de la bêta). On fait toujours une double confirmation pour éviter les faux positifs.",
        },
        {
          q: "Vous supportez ma marque préférée ?",
          a:
            "On lance avec Zara, COS, Aritzia, Uniqlo, Sézane, Mango, Arket et ASOS. Va sur la page Marques pour suggérer une boutique — les plus demandées passent sous 2 semaines.",
        },
        {
          q: "Je peux changer ma taille après coup ?",
          a:
            "Oui, à tout moment depuis le dashboard. Tu peux aussi surveiller plusieurs tailles d’un même produit — chacune compte comme un slot.",
        },
        {
          q: "Comment annuler le Pro ?",
          a:
            "En deux clics depuis ton compte (portail Stripe). Pas d’engagement, pas de mail à envoyer, pas de bouton caché.",
        },
        {
          q: "Vous vendez mes données ?",
          a:
            "Non. On gagne notre vie avec le plan Pro. Ton e-mail reste chez nous, point. Lis notre charte (lien dans le footer) — c’est court et clair.",
        },
      ],
    },
    manifesto: {
      eyebrow: "Manifesto",
      title: "Parce que le web a déjà bien assez de panneaux ÉPUISÉ.",
      paragraphs: [
        "On en a marre de checker. Marre des alertes natives qui arrivent quand c’est déjà reparti. Marre des outils techniques qui te demandent un selector CSS pour surveiller un t-shirt en taille S.",
        "Restocking, c’est l’outil qu’on aurait voulu pour soi. Une URL, une taille, un ping. Pas plus.",
        "Trois personnes basées entre Paris, Lyon et Berlin. Pas de levée, pas d’IA Bullshit, pas de revente de données. Juste un service qui te rend la mode européenne moins frustrante.",
        "On bosse pour que tu portes ce que tu aimes — pas pour que tu achètes ce qui reste.",
      ],
      signature: "— l’équipe restocking",
    },
    footer: {
      tagline: "Alertes de retour en stock par taille pour la mode européenne.",
      product: "Produit",
      legal: "Légal",
      links: {
        privacy: "Confidentialité",
        terms: "CGU",
        cookies: "Cookies",
        contact: "hello@restocking.app",
      },
      madeIn: "Fait avec ❤️ entre Paris, Lyon et Berlin.",
      rights: "Tous droits réservés.",
    },
  },
  en: {
    nav: {
      home: "Home",
      how: "How it works",
      retailers: "Stores",
      pricing: "Pricing",
      faq: "FAQ",
      manifesto: "Manifesto",
      cta: "Join the list",
    },
    common: {
      backHome: "Back to home",
      waitlist: "Waitlist",
      joinWaitlist: "Join the waitlist",
      joining: "Adding you…",
      yourEmail: "Your email",
      placeholder: "alex@example.com",
      success: "Welcome to the list 🎉",
      already: "You are already on the list — your spot is saved 💌",
      invalid: "Invalid email address.",
      error: "Oops, please try again in a moment.",
      counterPre: "already",
      counterPost: "fashion victims™ waiting",
      counterFallback: "Be one of the first to break the sold-out curse.",
      privacy: "No spam. We only write to announce the launch.",
      free: "Free",
      pro: "Pro",
      mostPopular: "Most loved 🔥",
      perMonth: "/ month",
      perYear: "/ year",
      monthly: "Monthly",
      annual: "Annual",
      saveBadge: "Save 30%",
      restocked: "RESTOCKED",
      soldOut: "SOLD OUT",
    },
    home: {
      eyebrow: "Size-specific restock alerts · Europe",
      h1Top: "Your size,",
      h1Mid: "the moment",
      h1Bot: "it comes back.",
      sub:
        "Restocking watches Zara, COS, Aritzia, Sézane, Uniqlo and 100 other shops. We ping you in under 5 minutes when your size returns — no 12 tabs, no setting alarms at 3am.",
      ctaPrimary: "Send me alerts",
      ctaSecondary: "See how it works",
      proofTitle: "A real pain, documented by shoppers",
      proofItems: [
        {
          quote:
            "I check Aritzia 30 times a day. The one time it restocked, I missed my size in 4 minutes.",
          author: "u/sara_lovesoutfits",
          source: "r/Aritzia",
        },
        {
          quote:
            "Zara’s official alert reached me 3 days after the restock. Almost insulting.",
          author: "Camille, 28",
          source: "Paris",
        },
        {
          quote:
            "I used to set night alarms to check COS. Restocking saved my Sunday.",
          author: "Tom, 26",
          source: "Berlin",
        },
        {
          quote:
            "Honestly Distill and the like are useless — you can’t filter by size.",
          author: "u/dropwatcher",
          source: "r/femalefashionadvice",
        },
      ],
      stats: [
        { value: "<5 min", label: "Avg. alert delay (Pro)" },
        { value: "120+", label: "Stores watched" },
        { value: "EU 34–50", label: "Every size" },
        { value: "0", label: "False positives — thanks to double-check" },
      ],
      bigCtaTitle: "The moment your size comes back, you’ll hear it from us.",
      bigCtaSub:
        "Join the waitlist. Get early access on launch day, plus 3 months of Pro free for the first 100.",
    },
    how: {
      eyebrow: "How it works",
      title: "Three steps. Zero CSS selector.",
      sub:
        "Restocking is built for your sister who doesn’t know what a domain is. Paste a URL, pick your size, we handle the rest.",
      steps: [
        {
          n: "01",
          title: "Paste the product URL",
          body:
            "Copy the link of the piece you’re after (Zara, COS, Sézane…). Restocking pulls the name, photo, price and all available variants automatically.",
          pill: "1 paste = 1 alert armed",
        },
        {
          n: "02",
          title: "Pick your size (and colour)",
          body:
            "Tap your exact variant — EU 36, navy blue, regular length. We won’t ping you for anything else.",
          pill: "Per-variant watching",
        },
        {
          n: "03",
          title: "Get an alert in under 5 min",
          body:
            "Instant email (and SMS on Pro) the second stock returns. With a direct link to the product page pre-filled with your size.",
          pill: "Faster than the brand’s own alert",
        },
      ],
      detailsTitle: "Under the hood",
      details: [
        {
          title: "4-layer detection",
          body:
            "We parse the e-commerce dataLayer, the state of the Add-to-Cart button, the variant attributes. Playwright as fallback for stubborn SPAs.",
        },
        {
          title: "Double confirmation",
          body:
            "A variant must be detected IN_STOCK twice in a row before triggering an alert. No more 3am ghost alerts.",
        },
        {
          title: "Retailer-friendly",
          body:
            "Public reads only, no aggressive scraping, clean rotation, max 1 request at a time per domain. We play fair.",
        },
        {
          title: "Hosted in Europe",
          body:
            "Data stored in Frankfurt (Supabase EU), GDPR compliant. Your email belongs to you.",
        },
      ],
    },
    retailers: {
      eyebrow: "Supported stores",
      title: "The shops we already watch.",
      sub:
        "At launch we cover the European mid-market retailers where native alerts fail the most. The list grows every week.",
      legendInStock: "Fully covered",
      legendBeta: "In beta",
      legendSoon: "Coming up",
      filterAll: "All",
      filterLive: "Live",
      filterBeta: "Beta",
      filterSoon: "Soon",
      tileCta: "Paste a URL",
      requestTitle: "Missing your favourite store?",
      requestBody:
        "Tell us which one. We prioritise the most requested stores. 50+ votes = added within 2 weeks.",
      requestCta: "Suggest a store",
      noResultsTitle: "Nothing in this filter for now.",
      noResultsBody: "Try another status, or suggest the store to us.",
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Simple price. Real difference.",
      sub:
        "Stay free to try it. Upgrade the day you miss a drop that matters.",
      toggleMonthly: "Monthly",
      toggleAnnual: "Annual · -30%",
      plans: {
        free: {
          name: "Free",
          tagline: "Just try it.",
          price: "€0",
          unit: "/ forever",
          features: [
            "3 watched products",
            "Check every 30 min",
            "Email notifications",
            "All live stores",
            "Real-time dashboard",
          ],
          cta: "Start free",
        },
        pro: {
          name: "Pro",
          tagline: "For the real hunters.",
          priceMonthly: "€7.99",
          priceAnnual: "€59",
          unitMonthly: "/ month",
          unitAnnual: "/ year · that’s €4.90/mo",
          features: [
            "20 watched products",
            "Check every 5 min · priority queue",
            "Instant email + SMS",
            "Playwright fallback unlocked (complex sites)",
            "Price + variant history",
            "Priority support",
          ],
          cta: "Go Pro",
        },
      },
      faqLink: "Questions about billing?",
      faqLinkCta: "Read the FAQ →",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Everything you would have asked us.",
      sub:
        "If something’s missing, just email us at hello@restocking.app — there are three humans behind this.",
      items: [
        {
          q: "Is this aggressive scraping?",
          a:
            "No. We only read public information (the same page you see). We respect rate limits, rotate user-agents properly, never bypass auth, and never automate purchases. We watch publicly, we don’t resell data.",
        },
        {
          q: "Is it legal in Europe?",
          a:
            "Yes. We watch prices and stock that are already publicly available. No paywall or auth bypass. GDPR: your email lives in Frankfurt and you can delete it in one click.",
        },
        {
          q: "How fast is the alert?",
          a:
            "Free: 30 minutes max. Pro: under 5 minutes (we measured median 2 min 40 during beta). We always run a double confirmation to kill false positives.",
        },
        {
          q: "Do you support my favourite store?",
          a:
            "We launch with Zara, COS, Aritzia, Uniqlo, Sézane, Mango, Arket and ASOS. Use the Stores page to suggest one — top requests ship within 2 weeks.",
        },
        {
          q: "Can I change my size later?",
          a:
            "Anytime, from your dashboard. You can also watch several sizes of the same product — each counts as one slot.",
        },
        {
          q: "How do I cancel Pro?",
          a:
            "Two clicks in your account (Stripe portal). No commitment, no support email needed, no hidden button.",
        },
        {
          q: "Do you sell my data?",
          a:
            "No. We make a living from the Pro plan. Your email stays with us, full stop. Read our policy (footer link) — it’s short and clear.",
        },
      ],
    },
    manifesto: {
      eyebrow: "Manifesto",
      title: "Because the web has enough sold-out signs already.",
      paragraphs: [
        "We’re tired of checking. Tired of native alerts arriving once it’s already gone. Tired of technical tools asking for a CSS selector just to watch a size S t-shirt.",
        "Restocking is the tool we wished we had. One URL, one size, one ping. That’s it.",
        "Three people based in Paris, Lyon and Berlin. No fundraise, no AI bullshit, no data resale. Just a service that makes European fashion a little less frustrating.",
        "We work so you wear what you love — not what’s left.",
      ],
      signature: "— the restocking team",
    },
    footer: {
      tagline: "Size-specific restock alerts for European fashion.",
      product: "Product",
      legal: "Legal",
      links: {
        privacy: "Privacy",
        terms: "Terms",
        cookies: "Cookies",
        contact: "hello@restocking.app",
      },
      madeIn: "Made with ❤️ between Paris, Lyon & Berlin.",
      rights: "All rights reserved.",
    },
  },
} as const;

export type Messages = (typeof messages)[Locale];
