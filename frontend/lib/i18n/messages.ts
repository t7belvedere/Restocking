export type Locale = "fr" | "en";

export const LOCALES: Locale[] = ["fr", "en"];
export const DEFAULT_LOCALE: Locale = "fr";

export type DashboardMessages = {
  greeting: (name: string | null) => string;
  addAlert: string;
  upgradeToPro: string;
  stats: {
    activeAlerts: string;
    paused: (n: number) => string;
    inStock: string;
    inStockSub: string;
    lastCheck: string;
    workerActive: string;
    plan: string;
    manage: string;
  };
  limitReached: string;
  limitBody: (active: number, plan: string, max: number) => string;
  emptyTitle: (name: string | null) => string;
  emptyBody: string;
  emptyCta: string;
  emptyFooter: string;
  relativeTime: {
    now: string;
    sec: (n: number) => string;
    min: (n: number) => string;
    hour: (n: number) => string;
    day: (n: number) => string;
  };
};

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
      eyebrow: "Alertes retour en stock par taille · Europe",
      h1Top: "Ta taille,",
      h1Mid: "pile",
      h1Bot: "quand elle revient.",
      sub:
        "On surveille Zara, COS, Aritzia, Sézane, Uniqlo et 100 autres marques pour toi. On te prévient en moins de 5 minutes dès que ta taille est dispo. Plus besoin d’ouvrir 12 onglets ou de te lever la nuit pour vérifier.",
      ctaPrimary: "Je veux être prévenue",
      ctaSecondary: "Comment ça marche",
      proofTitle: "Ce que disent les modeuses qui en avaient marre de rater leur taille",
      proofItems: [
        {
          quote:
            "Je checkais Aritzia 30 fois par jour. La fois où c’est revenu, j’ai raté ma taille en 4 minutes.",
          author: "u/sara_lovesoutfits",
          source: "r/Aritzia",
        },
        {
          quote:
            "L’alerte de Zara m’est arrivée 3 jours après. J’étais déjà passée à autre chose.",
          author: "Camille, 28 ans",
          source: "Paris",
        },
        {
          quote:
            "Je mettais des réveils la nuit pour vérifier COS. Depuis Restocking, je dors tranquille.",
          author: "Tom, 26 ans",
          source: "Berlin",
        },
        {
          quote:
            "Franchement les autres outils c’est une galère sans nom. Aucun ne te dit si ta taille précise est là.",
          author: "u/dropwatcher",
          source: "r/femalefashionadvice",
        },
      ],
      stats: [
        { value: "<5 min", label: "Délai moyen pour te prévenir" },
        { value: "120+", label: "Marques surveillées" },
        { value: "EU 34–50", label: "Toutes les tailles" },
        { value: "0", label: "Fausses alertes — on vérifie deux fois avant de te déranger" },
      ],
      bigCtaTitle: "La seconde où ta taille revient, on te le dit.",
      bigCtaSub:
        "Rejoins la liste d’attente. Tu auras ton accès dès l’ouverture, et 3 mois de Pro gratuits si tu fais partie des 100 premiers.",
    },
    how: {
      eyebrow: "Comment ça marche",
      title: "Trois étapes. Aussi simple que ça.",
      sub:
        "Pas besoin d’être experte en informatique. Tu copies un lien, tu choisis ta taille, on fait le reste.",
      steps: [
        {
          n: "01",
          title: "Copie le lien du produit",
          body:
            "Prends l’adresse du vêtement que tu veux sur le site de la marque (Zara, COS, Sézane…). On récupère automatiquement le nom, la photo, le prix et les tailles dispos.",
          pill: "1 lien = 1 alerte activée",
        },
        {
          n: "02",
          title: "Choisis ta taille (et ta couleur)",
          body:
            "Sélectionne TA taille et TA couleur. On te préviendra uniquement pour ça — pas pour une taille qui n’est pas la tienne.",
          pill: "Alerte sur mesure",
        },
        {
          n: "03",
          title: "Reçois l’alerte en moins de 5 min",
          body:
            "Email direct (et SMS en Pro) dès que c’est revenu. Avec un lien qui t’emmène directement sur la bonne page, dans ta taille.",
          pill: "Plus rapide que l’alerte de la marque",
        },
      ],
      detailsTitle: "Dans les coulisses",
      details: [
        {
          title: "On vérifie en continu",
          body:
            "On regarde la page du produit toutes les 5 minutes (Pro) ou 30 minutes (Free). On vérifie directement le bouton d’achat et les infos de stock du site. Comme toi tu le ferais, mais sans avoir à y penser.",
        },
        {
          title: "Deux confirmations avant de te prévenir",
          body:
            "On s’assure que le stock est vraiment revenu avant de t’envoyer quoi que ce soit. Si un article réapparaît 30 secondes à cause d’un panier abandonné, on ne te réveille pas à 3h. Zéro fausse joie.",
        },
        {
          title: "On respecte les marques",
          body:
            "On lit uniquement ce qui est visible pour tout le monde. Pas de piratage, pas d’achat automatique. On regarde la même page que toi, au même rythme.",
        },
        {
          title: "Données stockées en Europe",
          body:
            "Tout est hébergé à Francfort, chiffré et conforme RGPD. Ton email et tes alertes t’appartiennent. Tu peux tout exporter ou supprimer en un clic. On ne revend rien à personne.",
        },
        {
          title: "Alerte email et SMS",
          body:
            "Dès que ta taille revient, tu reçois un email avec le lien direct vers la page produit, dans ta taille. En Pro, on t’envoie aussi un SMS pour les articles qui partent vite. Pas de newsletter cachée derrière.",
        },
      ],
      whyTitle: "Pourquoi c’est mieux que les alertes des marques ?",
      whyItems: [
        {
          title: "Plus rapide",
          body:
            "Les marques envoient leurs alertes par paquets, parfois 2 à 24h après. Nous on vérifie chaque produit en direct, sans file d’attente. En moyenne, tu es prévenue en moins de 3 minutes.",
        },
        {
          title: "Pour ta taille exacte",
          body:
            "Les marques t’envoient une alerte générique pour le produit. Si le S revient et que tu fais du M, tu reçois une notif pour rien. Nous on te prévient uniquement pour la taille que tu suis.",
        },
        {
          title: "Toutes tes marques au même endroit",
          body:
            "Pas besoin de créer un compte chez Zara, un chez COS, un chez Sézane en croisant les doigts pour que leurs alertes fonctionnent. Un seul endroit, toutes tes marques, toutes tes tailles.",
        },
      ],
    },
    retailers: {
      eyebrow: "Toutes les marques",
      title: "N’importe quelle boutique. On s’en occupe.",
      sub:
        "On surveille toutes les boutiques de mode en Europe. Celles ci-dessous sont juste celles qu’on connaît le mieux — les autres marchent aussi.",
      legendInStock: "Ultra-rapide",
      legendBeta: "Fonctionne aussi",
      filterAll: "Toutes les marques",
      filterLive: "Ultra-rapides",
      filterBeta: "Universelles",
      tileCta: "Surveiller",
      requestTitle: "Une marque qui bloque ?",
      requestBody:
        "On ajoute des marques en permanence. Dis-nous celle qui te manque et on s’en occupe.",
      requestCta: "Suggérer une marque",
      noResultsTitle: "Pas de résultat.",
      noResultsBody: "Mais rappelle-toi : tous les sites marchent !",
      universalCardTitle: "Toutes les boutiques",
      universalCardBody: "Copie n’importe quel lien. Notre outil trouve ta taille automatiquement.",
      fadeMore: "Et des centaines d’autres marques...",
    },
    pricing: {
      eyebrow: "Tarifs",
      title: "Simple. Gratuit pour commencer.",
      sub:
        "Garde le plan Free le temps de tester. Passe en Pro quand tu veux être prévenue plus vite.",
      toggleMonthly: "Mensuel",
      toggleAnnual: "Annuel · -30%",
      plans: {
        free: {
          name: "Free",
          tagline: "Pour essayer.",
          price: "0€",
          unit: "/ pour toujours",
          features: [
            "3 vêtements surveillés",
            "Vérifié toutes les 30 min",
            "Alerte par email",
            "Toutes les marques",
            "Suivi en direct",
          ],
          cta: "Commencer gratuitement",
        },
        pro: {
          name: "Pro",
          tagline: "Pour ne plus rien rater.",
          priceMonthly: "7,99€",
          priceAnnual: "59€",
          unitMonthly: "/ mois",
          unitAnnual: "/ an · soit 4,90€/mois",
          features: [
            "20 vêtements surveillés",
            "Vérifié toutes les 5 min",
            "Alerte email + SMS",
            "Marche sur tous les sites, même complexes",
            "Historique des prix",
            "Support prioritaire",
          ],
          cta: "Passer Pro",
        },
      },
      faqLink: "Des questions sur le paiement ?",
      faqLinkCta: "Voir la FAQ →",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Tout ce que tu te demandes.",
      sub:
        "S’il manque une réponse, écris-nous à hello@restocking.app — on est trois humains.",
      items: [
        {
          q: "Vous faites du pillage de données ?",
          a:
            "Non. On regarde juste la page produit, comme toi tu le ferais. On ne pirate rien, on n’achète rien automatiquement. On surveille ce qui est visible par tout le monde, point.",
        },
        {
          q: "C’est légal en Europe ?",
          a:
            "Oui. On ne fait que regarder des prix et des stocks déjà publics. Tes données sont stockées en Allemagne (Francfort), et tu peux tout supprimer en un clic.",
        },
        {
          q: "Je suis prévenue en combien de temps ?",
          a:
            "Free : dans la demi-heure max. Pro : en moins de 5 minutes. Et on vérifie toujours deux fois avant d’envoyer une alerte, pour être sûrs que c’est vraiment revenu.",
        },
        {
          q: "Ma marque préférée est couverte ?",
          a:
            "On commence avec Zara, COS, Aritzia, Uniqlo, Sézane, Mango, Arket et ASOS. Si la tienne n’y est pas, dis-le nous sur la page Marques — on l’ajoute en moins de 2 semaines.",
        },
        {
          q: "Je peux changer de taille plus tard ?",
          a:
            "Oui, à tout moment. Tu peux aussi surveiller plusieurs tailles du même vêtement — chaque taille compte pour une alerte.",
        },
        {
          q: "Comment j’annule le Pro ?",
          a:
            "En deux clics depuis ton compte. Pas d’engagement, pas de mail à envoyer, pas de piège.",
        },
        {
          q: "Vous vendez mes données ?",
          a:
            "Jamais. On vit grâce au plan Pro, pas grâce à tes infos. Ton email reste chez nous.",
        },
        {
          q: "Quelles boutiques vous surveillez ?",
          a:
            "Zara, COS, Aritzia, Uniqlo, Sézane, Mango, Arket, ASOS, Ganni, Massimo Dutti, & Other Stories et 50+ autres. La liste complète est sur la page Marques.",
        },
        {
          q: "Comment ça marche techniquement ?",
          a:
            "On vérifie la page du produit toutes les 5 minutes (Pro) ou 30 minutes (Free). On regarde si le bouton Acheter est actif, on lit les infos de stock. Si c’est trop compliqué pour notre outil, on ouvre la page comme un navigateur normal et on regarde. Rien de magique.",
        },
        {
          q: "Pourquoi c’est plus rapide que les alertes des marques ?",
          a:
            "Les marques envoient leurs alertes par vagues, parfois avec 24h de retard. Nous on vérifie ton produit en direct, tout le temps. C’est pas sorcier : on n’attend pas dans la file d’envoi de la marque.",
        },
        {
          q: "Combien de produits je peux surveiller ?",
          a:
            "3 en Free, 20 en Pro. Chaque taille+couleur compte pour 1. Si tu veux un t-shirt en S et en M, c’est 2 alertes. Tu changes quand tu veux.",
        },
        {
          q: "Et les marques hors Europe ?",
          a:
            "Notre priorité c’est l’Europe, mais on surveille déjà Aritzia, Reformation, Khaite. Si le site est en français ou en anglais, ça devrait marcher. Dis-nous celle qui te manque.",
        },
      ],
    },
    manifesto: {
      eyebrow: "Manifesto",
      title: "Parce qu’il y a déjà bien assez de panneaux ÉPUISÉ.",
      paragraphs: [
        "On en a marre de vérifier. Marre des alertes qui arrivent quand c’est déjà reparti. Marre des outils incompréhensibles.",
        "Restocking, c’est ce qu’on rêvait d’avoir. Un lien, une taille, une alerte. Point.",
        "Trois personnes entre Paris, Lyon et Berlin. Pas de levée de fonds, pas d’IA bullshit, pas de revente de données. Juste un service qui rend la mode un peu moins frustrante.",
        "On a commencé après avoir raté un manteau COS pour la troisième fois. Taille S, bleu marine. Revenu en stock à 4h du matin, reparti à 4h07. Pas une seule alerte. C’est là qu’on a compris.",
        "Aujourd’hui on surveille 120+ marques toutes les 5 minutes. On vérifie les pages produit comme tu le ferais — juste sans avoir à y penser. Rien de magique, du travail bien fait.",
        "On ne te spamme pas. On ne te vend rien. On te prévient quand c’est vraiment revenu, dans ta taille, pour le produit que tu veux. Point.",
        "On fait ça pour que tu portes ce que tu aimes — pas ce qui reste.",
      ],
      signature: "— l’équipe restocking",
    },
    footer: {
      tagline: "Alertes retour en stock par taille. Mode européenne.",
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
    legal: {
      privacy: {
        title: "Politique de Confidentialité",
        lastUpdated: "Mis à jour le 24 mai 2026",
        intro: "On déteste le spam autant que toi. Tes infos servent uniquement à te prévenir quand ton vêtement préféré revient.",
        sections: [
          {
            title: "Données collectées",
            content: "On garde ton email, ta langue, et les liens des produits que tu suis. C'est tout.",
          },
          {
            title: "Usage des données",
            content: "Ton e-mail sert uniquement à t'envoyer les alertes et des nouvelles importantes sur le service. On ne vendra JAMAIS ta data à des tiers.",
          },
          {
            title: "Hébergement",
            content: "Tes données sont stockées en Europe (région Frankfurt) sur les serveurs sécurisés de Supabase.",
          },
        ],
      },
      terms: {
        title: "Conditions Générales d'Utilisation",
        lastUpdated: "Mis à jour le 24 mai 2026",
        intro: "En utilisant Restocking, tu acceptes ces quelques règles simples.",
        sections: [
          {
            title: "Le Service",
            content: "Restocking est un outil de veille. On fait de notre mieux pour être les plus rapides, mais on ne peut pas garantir que tu réussiras à acheter le produit avant les autres.",
          },
          {
            title: "Usage loyal",
            content: "Le service est destiné à un usage personnel. Toute tentative d'automatisation massive ou de dégradation du service pourra entraîner un bannissement.",
          },
          {
            title: "Abonnement Pro",
            content: "Le plan Pro est sans engagement. Tu peux annuler à tout moment depuis ton dashboard.",
          },
        ],
      },
      cookies: {
        title: "Politique des Cookies",
        lastUpdated: "Mis à jour le 24 mai 2026",
        intro: "On utilise le strict minimum pour que le site fonctionne.",
        sections: [
          {
            title: "Cookies essentiels",
            content: "Ces cookies servent à mémoriser ta session d'authentification et ta préférence de langue. Sans eux, le site ne marche pas.",
          },
          {
            title: "Analytique",
            content: "On utilise des outils respectueux de la vie privée pour comprendre comment le site est utilisé, sans te tracker personnellement.",
          },
        ],
      },
    },
    profile: {
      settingsTitle: "Paramètres du compte",
      settingsSub: "Email, mot de passe et notifications.",
      preferencesTitle: "Préférences",
      preferencesSub: "Tes marques préférées et ta taille pour mieux te servir.",
      changeEmailTitle: "Changer d'email",
      changeEmailDesc: "On t'envoie un lien de confirmation sur ta nouvelle adresse.",
      newEmailLabel: "Nouvel email",
      changeEmailButton: "Changer",
      changeEmailPending: "Envoi…",
      changeEmailSuccess: "Lien envoyé. Vérifie ta nouvelle boîte mail.",
      changePasswordTitle: "Changer de mot de passe",
      changePasswordDesc: "8 caractères minimum.",
      currentPasswordLabel: "Mot de passe actuel",
      newPasswordLabel: "Nouveau mot de passe",
      confirmPasswordLabel: "Confirme le nouveau",
      changePasswordButton: "Changer",
      changePasswordPending: "Changement…",
      changePasswordSuccess: "Mot de passe mis à jour.",
      passwordMismatch: "Les mots de passe ne correspondent pas.",
      passwordTooShort: "8 caractères minimum.",
      saveButton: "Sauvegarder",
      saving: "Sauvegarde…",
      saved: "Sauvegardé !",
      saveError: "Erreur lors de la sauvegarde.",
    },
    addWatch: {
      pageTitle: "Nouvelle alerte",
      pageSub: "Collez l'URL d'un produit, choisissez votre taille — on s'occupe du reste.",
      urlLabel: "URL du produit",
      urlHelp: "Collez le lien direct de la fiche produit. On lit les balises publiques pour pré-remplir le formulaire.",
      urlPlaceholder: "https://www.cos.com/...",
      analyze: "Analyser le produit",
      analyzing: "Analyse en cours…",
      blockedWarning: (brand: string) => `${brand} n'est pas compatible avec notre analyse automatique. Tu peux créer l'alerte manuellement, mais la détection des informations produit ne fonctionnera pas sur ce site.`,
      limitedWarning: (brand: string) => `${brand} utilise des protections qui peuvent limiter la détection. L'analyse reste fonctionnelle mais les variantes ou les images pourraient être incomplètes.`,
      modifyUrl: "Modifier l'URL",
      noImage: "Sans visuel",
      productName: "Nom du produit",
      productNamePlaceholder: "ex: Manteau oversize en laine",
      size: "Taille",
      color: "Couleur",
      oosBadge: "épuisé",
      selectVariant: "Sélectionne ta taille / couleur",
      selectVariantHelp: "Sélectionnez la variante exacte que vous souhaitez surveiller.",
      manualVariantPlaceholder: "ex: Taille S / Bleu marine",
      noVariantsHelp: "Aucune variante détectée — saisissez la taille / couleur manuellement.",
      cancel: "Annuler",
      activate: "Activer l'alerte",
      activating: "Activation…",
      enrichmentPending: "Le site bloque notre lecture automatique. Vous pouvez créer l'alerte et notre worker enrichira la fiche dans quelques minutes.",
      partialAnalysis: "Analyse partielle — la page a mis trop de temps à répondre.",
      couldNotRead: "On n'a pas pu lire la fiche produit, vous pouvez compléter manuellement.",
      networkError: "Erreur réseau. Réessayez dans un instant.",
      selectSizeColor: "Sélectionnez une taille et une couleur avant d'activer.",
      chooseVariant: "Choisissez une taille / couleur avant d'activer.",
      limitReached: "Limite de votre plan atteinte. Passez à Pro pour en suivre plus.",
      invalidUrl: "URL invalide.",
      createFailed: "Impossible de créer l'alerte.",
      activated: "Alerte activée ✓",
      progressHttp: "Connexion au site...",
    },
    dashboard: {
      greeting: (name: string | null) => name ? `Salut ${name}` : "Mes alertes",
      addAlert: "Ajouter une alerte",
      upgradeToPro: "Passer à Pro",
      upgradeCta: "Débloque tout",
      myPlan: "Ton plan",
      upgradeTitle: "Passe en Pro, ne rate plus jamais ta taille",
      managePlan: "Gère ton abonnement",
      upgradeSub: "Plus de produits, des checks plus rapides, des alertes SMS. Annulable en deux clics.",
      manageSub: "Modifie, mets en pause ou annule ton plan Pro depuis le portail Stripe.",
      securePayment: "Paiement sécurisé via Stripe. Annulable à tout moment, sans engagement.",
      upgradeCards: {
        freeTitle: "Pour démarrer en douceur.",
        freePrice: "0 €",
        freeUnit: "/ pour toujours",
        freeFeatures: ["3 produits surveillés", "Vérification toutes les 30 min", "Notifications email", "Dashboard temps réel"],
        currentPlan: "Plan actuel",
        downgrade: "Rétrograder",
        proTitle: "Pour ne rien rater, jamais.",
        proPrice: "7,99 €",
        proUnit: "/ mois",
        proAnnual: "ou 59 €/an (deux mois offerts)",
        recommended: "Recommandé",
        proFeatures: [
          "20 produits surveillés au lieu de 3",
          "Vérification toutes les 5 minutes",
          "Notifications email + SMS instantanées",
          "Fallback Playwright pour les sites complexes",
          "Historique des vérifications illimité",
          "Support prioritaire",
        ],
        manageStripe: "Gérer mon abonnement (Stripe)",
        monthlyCta: "Pro mensuel — 7,99 €/mois",
        annualCta: "Pro annuel — 59 €/an (2 mois offerts)",
        redirectingStripe: "Redirection vers Stripe…",
        redirecting: "Redirection…",
      },
      stats: {
        activeAlerts: "Alertes actives",
        paused: (n: number) => `${n} en pause`,
        inStock: "En stock",
        inStockSub: "Disponible",
        lastCheck: "Dernière vérif",
        workerActive: "Surveillance active",
        plan: "Mon plan",
        manage: "Gérer →",
      },
      limitReached: "Limite atteinte",
      limitBody: (active: number, plan: string, max: number) =>
        `Tu as ${active} alertes sur ton plan ${plan} (max ${max}). Passe à Pro pour 20 alertes et des vérifications toutes les 5 minutes.`,
      emptyTitle: (name: string | null) => name ? `Prête à chasser, ${name} ?` : "Prête à commencer ?",
      emptyBody: "Copie le lien d'un vêtement que tu as raté, choisis ta taille, et on s'occupe de tout.",
      emptyCta: "Ajouter ma première alerte",
      emptyFooter: "Zara, COS, Aritzia, Sézane, Uniqlo et 120+ autres marques",
      relativeTime: {
        now: "à l'instant",
        sec: (n: number) => `il y a ${n}s`,
        min: (n: number) => `il y a ${n} min`,
        hour: (n: number) => `il y a ${n}h`,
        day: (n: number) => `il y a ${n}j`,
      },
    },
    watchDetail: {
      backToAlerts: "Mes alertes",
      noImage: "Sans photo",
      untitled: "Produit sans titre",
      variant: "Variante",
      price: "Prix",
      createdAt: "Ajoutée le",
      checkHistory: "Historique des vérifications",
      checkHistoryDesc: "Les 20 dernières vérifications — mis à jour automatiquement.",
      live: "En direct",
      neverChecked: "pas encore vérifié",
      relativeTime: { now: "à l'instant", sec: (n: number) => `il y a ${n}s`, min: (n: number) => `il y a ${n} min`, hour: (n: number) => `il y a ${n}h`, day: (n: number) => `il y a ${n}j` },
      tableDate: "Quand",
      tableStatus: "État",
      tableSource: "Méthode",
      tablePrice: "Prix",
      sourceDataLayer: "Infos du site",
      sourceAddToCart: "Bouton d'achat",
      sourceVariant: "Détail taille",
      sourcePlaywright: "Analyse complète",
      emptyCheckTitle: "En attente de la première vérification…",
      emptyCheckBody: "On va bientôt regarder ce produit pour toi. Les résultats s'afficheront ici.",
      lastCheck: "Vérifié",
      paused: "En pause",
      inStock: "En stock",
      outOfStock: "Rupture",
      pending: "En attente",
      reactivated: "Alerte réactivée",
      pausedToast: "Alerte en pause",
      actionFailed: "Impossible",
      pause: "Mettre en pause",
      reactivate: "Réactiver",
      delete: "Supprimer",
      deleteTitle: "Supprimer cette alerte ?",
      deleteDesc: "Cette action est définitive. L'historique sera aussi supprimé.",
      cancel: "Annuler",
      deleteForever: "Supprimer définitivement",
    },
    auth: {
      signIn: "Se connecter",
      signUp: "Créer un compte",
      logout: "Se déconnecter",
      orContinue: "ou continuer avec",
      continueGoogle: "Continuer avec Google",
      continueApple: "Continuer avec Apple",
      email: "E-mail",
      password: "Mot de passe",
      passwordHint: "8 caractères minimum.",
      emailPlaceholder: "marine@exemple.fr",
      noAccount: "Pas encore de compte ?",
      haveAccount: "Tu as déjà un compte ?",
      forgotPassword: "Mot de passe oublié ?",
      forgotPasswordTitle: "Mot de passe oublié",
      forgotPasswordSub: "Saisis ton e-mail, on t’envoie un lien de réinitialisation.",
      forgotPasswordSubmit: "M’envoyer le lien",
      forgotPasswordPending: "Envoi…",
      forgotPasswordSuccessTitle: "Lien envoyé",
      forgotPasswordSuccessBody:
        "Si un compte existe pour cet e-mail, tu recevras un lien de réinitialisation. Vérifie tes spams si tu ne le vois pas.",
      forgotPasswordBackToLogin: "Retour à la connexion",
      resetPasswordTitle: "Nouveau mot de passe",
      resetPasswordSub: "Choisis un nouveau mot de passe pour ton compte.",
      resetPasswordNewPassword: "Nouveau mot de passe",
      resetPasswordSubmit: "Mettre à jour",
      resetPasswordPending: "Mise à jour…",
      resetPasswordSuccess: "Mot de passe mis à jour. Redirection vers la connexion…",
      resetPasswordError: "Le lien est expiré ou déjà utilisé. Redemande un nouveau lien.",
      signInTitle: "Bon retour.",
      signInSub: "Reprends la chasse au stock là où tu l’avais laissée.",
      signInSubmit: "Se connecter",
      signInPending: "Connexion…",
      signUpTitle: "Crée ton compte.",
      signUpSub: "Trois minutes pour ne plus jamais rater ta taille.",
      signUpSubmit: "Créer mon compte",
      signUpPending: "Création…",
      checkEmailTitle: "Vérifie ta boîte mail",
      checkEmailBody:
        "On vient d’envoyer un lien de confirmation à",
      checkEmailHint:
        "Le lien expire dans 24h. Vérifie aussi tes spams.",
      notConfiguredTitle: "Ouverture imminente",
      notConfiguredBody:
        "On peaufine les derniers réglages. Rejoins la liste d’attente en attendant — on t’écrit dès le lancement.",
      notConfiguredCta: "Rejoindre la liste",
      legalBlurb: "En continuant, tu acceptes nos CGU et notre politique de confidentialité.",
      onboarding: {
        stepLabel: (current: number, total: number) => `Étape ${current}/${total}`,
        brandsTitle: "Tu suis quelles marques ?",
        brandsSub: "On surveillera leurs restocks pour toi",
        brandsContinue: "Continuer",
        sizeTitle: "Ta taille habituelle ?",
        sizeSub: "On pré-remplira tes futures alertes avec",
        sizeContinue: "Continuer",
        nameTitle: "On t'appelle comment ?",
        nameSub: "Pour personnaliser tes alertes",
        namePlaceholder: "Ton prénom",
        nameContinue: "Presque fini",
        productTitle: "Un produit en tête ?",
        productSub: "Copie le lien du vêtement que tu as raté, on crée ta première alerte",
        productPlaceholder: "https://www.zara.com/...",
        productSkip: "Passer",
        productInvalidUrl: "Ce lien n'a pas l'air valide.",
        productCta: "Créer l'alerte",
        signupTitle: "On enregistre tout ça",
        signupSub: "Pour ne pas perdre ta sélection",
        successTitle: "Tout est prêt !",
        successBody: "Vérifie ta boîte mail pour confirmer. Ta première alerte t'attend.",
        successCta: "Ajouter ma première alerte",
      },
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
        "We watch Zara, COS, Aritzia, Sézane, Uniqlo and 100+ other stores for you. We’ll let you know in under 5 minutes when your size is back. No more 12 tabs open, no more checking at 3am.",
      ctaPrimary: "Keep me posted",
      ctaSecondary: "How it works",
      proofTitle: "From shoppers who were tired of missing out",
      proofItems: [
        {
          quote:
            "I used to check Aritzia 30 times a day. The one time it restocked, I missed my size by 4 minutes.",
          author: "u/sara_lovesoutfits",
          source: "r/Aritzia",
        },
        {
          quote:
            "Zara’s alert reached me 3 days later. I’d already moved on.",
          author: "Camille, 28",
          source: "Paris",
        },
        {
          quote:
            "I used to set alarms at night for COS. Restocking let me sleep again.",
          author: "Tom, 26",
          source: "Berlin",
        },
        {
          quote:
            "Honestly the other tools are a nightmare. None of them tell you about your exact size.",
          author: "u/dropwatcher",
          source: "r/femalefashionadvice",
        },
      ],
      stats: [
        { value: "<5 min", label: "Average time to alert you" },
        { value: "120+", label: "Stores watched" },
        { value: "EU 34–50", label: "Every size covered" },
        { value: "0", label: "False alerts — we check twice before messaging you" },
      ],
      bigCtaTitle: "The second your size comes back, we’ll let you know.",
      bigCtaSub:
        "Join the waitlist. Get access on launch day, plus 3 months of Pro free for the first 100.",
    },
    how: {
      eyebrow: "How it works",
      title: "Three steps. As simple as that.",
      sub:
        "No tech skills needed. You copy a link, pick your size, and we handle everything else.",
      steps: [
        {
          n: "01",
          title: "Copy the product link",
          body:
            "Grab the link of the piece you want from the brand’s website (Zara, COS, Sézane…). We automatically pull the name, photo, price and all available sizes.",
          pill: "1 link = 1 alert active",
        },
        {
          n: "02",
          title: "Pick your size (and colour)",
          body:
            "Select YOUR size and YOUR colour. We’ll only let you know about that one — not some random size that isn’t yours.",
          pill: "Tailored to you",
        },
        {
          n: "03",
          title: "Get your alert in under 5 min",
          body:
            "Email straight to your inbox (and SMS on Pro) the moment it’s back. With a link that takes you right to the product page, in your size.",
          pill: "Faster than the brand’s own alert",
        },
      ],
      detailsTitle: "Behind the scenes",
      details: [
        {
          title: "We check non-stop",
          body:
            "We look at the product page every 5 minutes (Pro) or 30 minutes (Free). We check the buy button and the stock info directly on the site — just like you would, but without you having to think about it.",
        },
        {
          title: "Two checks before we tell you",
          body:
            "We make sure it’s really back before we send anything. If an item reappears for 30 seconds because someone abandoned their cart, we don’t wake you up. No false hope.",
        },
        {
          title: "We respect the stores",
          body:
            "We only look at what’s publicly visible. No hacking, no auto-buying. We browse the same page you see, at human speed.",
        },
        {
          title: "Data stored in Europe",
          body:
            "Everything is hosted in Frankfurt, encrypted and GDPR compliant. Your email and alerts belong to you. Export or delete them in one click. We never sell anything to anyone.",
        },
        {
          title: "Email and SMS alerts",
          body:
            "As soon as your size is back, you get an email with a direct link to the product page, in your size. On Pro, we also text you for items that sell out fast. No hidden newsletter.",
        },
      ],
      whyTitle: "Why is this better than the brand’s own alerts?",
      whyItems: [
        {
          title: "Faster",
          body:
            "Brands send their alerts in batches — sometimes 2 to 24 hours late. We check each product live, no queue. On average, you’ll know in under 3 minutes.",
        },
        {
          title: "Your exact size",
          body:
            "Brands send a generic alert for the product. If size S comes back and you wear M, you get a notification for nothing. We only let you know about the size you’re watching.",
        },
        {
          title: "All your brands, one place",
          body:
            "No need to create accounts at Zara, COS, Sézane and cross your fingers that each one’s alerts work. One place, every brand, every size.",
        },
      ],
    },
    retailers: {
      eyebrow: "All stores",
      title: "Any store. We’ve got it.",
      sub:
        "We watch every fashion store in Europe. The ones below are just the ones we know best — the rest work too.",
      legendInStock: "Ultra-fast",
      legendBeta: "Also works",
      filterAll: "All stores",
      filterLive: "Ultra-fast",
      filterBeta: "Universal",
      tileCta: "Watch",
      requestTitle: "A store we missed?",
      requestBody:
        "We add stores all the time. Tell us which one you need and we’ll get on it.",
      requestCta: "Suggest a store",
      noResultsTitle: "No match.",
      noResultsBody: "But remember: every store works!",
      universalCardTitle: "All stores",
      universalCardBody: "Paste any link. We’ll find your size automatically.",
      fadeMore: "And hundreds of other brands...",
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Simple. Start free.",
      sub:
        "Stay on Free to test it out. Upgrade when you want faster alerts.",
      toggleMonthly: "Monthly",
      toggleAnnual: "Annual · -30%",
      plans: {
        free: {
          name: "Free",
          tagline: "To try it out.",
          price: "€0",
          unit: "/ forever",
          features: [
            "3 items watched",
            "Checked every 30 min",
            "Email alerts",
            "All stores supported",
            "Live tracking",
          ],
          cta: "Start free",
        },
        pro: {
          name: "Pro",
          tagline: "For never missing out.",
          priceMonthly: "€7.99",
          priceAnnual: "€59",
          unitMonthly: "/ month",
          unitAnnual: "/ year · that’s €4.90/mo",
          features: [
            "20 items watched",
            "Checked every 5 min",
            "Email + SMS alerts",
            "Works on every site, even tricky ones",
            "Price history",
            "Priority support",
          ],
          cta: "Go Pro",
        },
      },
      faqLink: "Questions about payment?",
      faqLinkCta: "Read the FAQ →",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Everything you’re wondering.",
      sub:
        "Something missing? Email us at hello@restocking.app — there are three real humans here.",
      items: [
        {
          q: "Is this data theft?",
          a:
            "No. We just look at the product page, like you do. No hacking, no auto-buying. We only watch what’s publicly visible to everyone.",
        },
        {
          q: "Is it legal in Europe?",
          a:
            "Yes. We only look at prices and stock that are already public. Your data is stored in Germany (Frankfurt), and you can delete everything in one click.",
        },
        {
          q: "How fast will I know?",
          a:
            "Free: within 30 minutes. Pro: under 5 minutes. And we always check twice before sending you anything — just to be sure it’s really back.",
        },
        {
          q: "Is my favourite store covered?",
          a:
            "We’re launching with Zara, COS, Aritzia, Uniqlo, Sézane, Mango, Arket and ASOS. Missing yours? Tell us on the Stores page and we’ll add it within 2 weeks.",
        },
        {
          q: "Can I change my size later?",
          a:
            "Anytime. You can also track several sizes of the same item — each size counts as one alert.",
        },
        {
          q: "How do I cancel Pro?",
          a:
            "Two clicks from your account. No commitment, no email needed, no hidden buttons.",
        },
        {
          q: "Do you sell my data?",
          a:
            "Never. We make money from the Pro plan, not from your info. Your email stays with us.",
        },
        {
          q: "Which stores do you watch?",
          a:
            "Zara, COS, Aritzia, Uniqlo, Sézane, Mango, Arket, ASOS, Ganni, Massimo Dutti, & Other Stories and 50+ more. The full list is on the Stores page.",
        },
        {
          q: "How does it work behind the scenes?",
          a:
            "We check the product page every 5 minutes (Pro) or 30 minutes (Free). We look at the buy button, we read the stock info. If the page is tricky, we open it like a normal browser and look. Nothing magical.",
        },
        {
          q: "Why are you faster than the brands?",
          a:
            "Brands send their alerts in batches — sometimes 24 hours late. We check your product live, all the time. Simple: we don’t wait in their email queue.",
        },
        {
          q: "How many items can I track?",
          a:
            "3 on Free, 20 on Pro. Each size+colour counts as 1. If you want a t-shirt in S and M, that’s 2 alerts. Swap anytime.",
        },
        {
          q: "What about non-European stores?",
          a:
            "Our focus is Europe, but we already cover Aritzia, Reformation, Khaite. If the site is in English or French, it should work. Tell us which one you need.",
        },
      ],
    },
    manifesto: {
      eyebrow: "Manifesto",
      title: "Because there are enough sold-out signs already.",
      paragraphs: [
        "We’re tired of checking. Tired of alerts arriving after it’s already gone. Tired of tools that make no sense.",
        "Restocking is what we always wanted. One link, one size, one alert. That’s it.",
        "Three people between Paris, Lyon and Berlin. No fundraising, no AI bullshit, no selling data. Just a service that makes fashion a little less frustrating.",
        "We started this after missing a COS coat for the third time. Size S, navy blue. Restocked at 4am, gone by 4:07. Not a single alert. That’s when we knew.",
        "Today we watch 120+ brands every 5 minutes. We check product pages like you would — just without you having to think about it. Nothing magical, just good work.",
        "We don’t spam you. We don’t sell you. We let you know when it’s really back, in your size, for the item you want. Full stop.",
        "We do this so you wear what you love — not what’s left.",
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
    legal: {
      privacy: {
        title: "Privacy Policy",
        lastUpdated: "Updated May 24, 2026",
        intro: "At Restocking, we hate spam as much as you do. Your data is used only to notify you when your favorite item comes back in stock.",
        sections: [
          {
            title: "Data Collected",
            content: "We keep your email, your language preference, and the product URLs you watch. That's all.",
          },
          {
            title: "Data Usage",
            content: "Your email is only used to send alerts and important service updates. We will NEVER sell your data to third parties.",
          },
          {
            title: "Hosting",
            content: "Your data is stored in Europe (Frankfurt region) on Supabase's secure servers.",
          },
        ],
      },
      terms: {
        title: "Terms of Service",
        lastUpdated: "Updated May 24, 2026",
        intro: "By using Restocking, you agree to these simple rules.",
        sections: [
          {
            title: "The Service",
            content: "Restocking is a monitoring tool. We do our best to be the fastest, but we cannot guarantee that you will succeed in buying the product before others.",
          },
          {
            title: "Fair Use",
            content: "The service is intended for personal use. Any attempt at massive automation or degradation of the service may result in a ban.",
          },
          {
            title: "Pro Subscription",
            content: "The Pro plan is no-commitment. You can cancel at any time from your dashboard.",
          },
        ],
      },
      cookies: {
        title: "Cookie Policy",
        lastUpdated: "Updated May 24, 2026",
        intro: "We use the strict minimum to keep the site running.",
        sections: [
          {
            title: "Essential Cookies",
            content: "These cookies are used to remember your authentication session and language preference. Without them, the site won't work.",
          },
          {
            title: "Analytics",
            content: "We use privacy-friendly tools to understand how the site is used, without tracking you personally.",
          },
        ],
      },
    },
    profile: {
      settingsTitle: "Account settings",
      settingsSub: "Email, password and notifications.",
      preferencesTitle: "Preferences",
      preferencesSub: "Your favourite brands and size so we can help you better.",
      changeEmailTitle: "Change email",
      changeEmailDesc: "We'll send a confirmation link to your new address.",
      newEmailLabel: "New email",
      changeEmailButton: "Change",
      changeEmailPending: "Sending…",
      changeEmailSuccess: "Link sent. Check your new inbox.",
      changePasswordTitle: "Change password",
      changePasswordDesc: "At least 8 characters.",
      currentPasswordLabel: "Current password",
      newPasswordLabel: "New password",
      confirmPasswordLabel: "Confirm new password",
      changePasswordButton: "Change",
      changePasswordPending: "Changing…",
      changePasswordSuccess: "Password updated.",
      passwordMismatch: "Passwords don't match.",
      passwordTooShort: "At least 8 characters.",
      saveButton: "Save",
      saving: "Saving…",
      saved: "Saved!",
      saveError: "Couldn't save.",
    },
    addWatch: {
      pageTitle: "New alert",
      pageSub: "Paste a product URL, pick your size — we'll handle the rest.",
      urlLabel: "Product URL",
      urlHelp: "Paste the direct link to the product page. We read the public tags to pre-fill the form.",
      urlPlaceholder: "https://www.cos.com/...",
      analyze: "Analyze product",
      analyzing: "Analyzing…",
      blockedWarning: (brand: string) => `${brand} is not compatible with our automatic analysis. You can create the alert manually, but product info detection won't work on this site.`,
      limitedWarning: (brand: string) => `${brand} uses anti-bot protection that may limit detection. Analysis still works but variants or images may be incomplete.`,
      modifyUrl: "Edit URL",
      noImage: "No image",
      productName: "Product name",
      productNamePlaceholder: "e.g. Oversized wool coat",
      size: "Size",
      color: "Color",
      oosBadge: "sold out",
      selectVariant: "Select your size / color",
      selectVariantHelp: "Select the exact variant you want to track.",
      manualVariantPlaceholder: "e.g. Size S / Navy blue",
      noVariantsHelp: "No variants detected — enter the size / color manually.",
      cancel: "Cancel",
      activate: "Activate alert",
      activating: "Activating…",
      enrichmentPending: "The site is blocking our automatic reading. You can create the alert and our worker will enrich the listing in a few minutes.",
      partialAnalysis: "Partial analysis — the page took too long to respond.",
      couldNotRead: "We couldn't read the product page. You can fill in the details manually.",
      networkError: "Network error. Please try again shortly.",
      selectSizeColor: "Select a size and color before activating.",
      chooseVariant: "Choose a size / color before activating.",
      limitReached: "Plan limit reached. Upgrade to Pro to track more.",
      invalidUrl: "Invalid URL.",
      createFailed: "Couldn't create alert.",
      activated: "Alert activated ✓",
      progressHttp: "Connecting to site...",
    },
    dashboard: {
      greeting: (name: string | null) => name ? `Hey ${name}` : "My alerts",
      addAlert: "Add an alert",
      upgradeToPro: "Go Pro",
      upgradeCta: "Unlock everything",
      myPlan: "Your plan",
      upgradeTitle: "Go Pro, never miss your size again",
      managePlan: "Manage your subscription",
      upgradeSub: "More products, faster checks, SMS alerts. Cancel anytime in two clicks.",
      manageSub: "Modify, pause or cancel your Pro plan from the Stripe portal.",
      securePayment: "Secure payment via Stripe. Cancel anytime, no commitment.",
      upgradeCards: {
        freeTitle: "To get started.",
        freePrice: "€0",
        freeUnit: "/ forever",
        freeFeatures: ["3 items tracked", "Checked every 30 min", "Email notifications", "Live dashboard"],
        currentPlan: "Current plan",
        downgrade: "Downgrade",
        proTitle: "To never miss out.",
        proPrice: "€7.99",
        proUnit: "/ month",
        proAnnual: "or €59/year (two months free)",
        recommended: "Recommended",
        proFeatures: [
          "20 items tracked instead of 3",
          "Checks every 5 minutes",
          "Instant email + SMS notifications",
          "Playwright fallback for tricky sites",
          "Unlimited check history",
          "Priority support",
        ],
        manageStripe: "Manage subscription (Stripe)",
        monthlyCta: "Pro monthly — €7.99/mo",
        annualCta: "Pro annual — €59/yr (2 months free)",
        redirectingStripe: "Redirecting to Stripe…",
        redirecting: "Redirecting…",
      },
      stats: {
        activeAlerts: "Active alerts",
        paused: (n: number) => `${n} paused`,
        inStock: "In stock",
        inStockSub: "Available now",
        lastCheck: "Last check",
        workerActive: "Watching now",
        plan: "My plan",
        manage: "Manage →",
      },
      limitReached: "Limit reached",
      limitBody: (active: number, plan: string, max: number) =>
        `You have ${active} alerts on your ${plan} plan (max ${max}). Upgrade to Pro for 20 alerts and checks every 5 minutes.`,
      emptyTitle: (name: string | null) => name ? `Ready to hunt, ${name}?` : "Ready to start?",
      emptyBody: "Paste the link of an item you missed, pick your size, and we'll take care of the rest.",
      emptyCta: "Add my first alert",
      emptyFooter: "Zara, COS, Aritzia, Sézane, Uniqlo and 120+ other brands",
      relativeTime: {
        now: "just now",
        sec: (n: number) => `${n}s ago`,
        min: (n: number) => `${n} min ago`,
        hour: (n: number) => `${n}h ago`,
        day: (n: number) => `${n}d ago`,
      },
    },
    watchDetail: {
      backToAlerts: "My alerts",
      noImage: "No photo",
      untitled: "Untitled product",
      variant: "Variant",
      price: "Price",
      createdAt: "Added",
      checkHistory: "Check history",
      checkHistoryDesc: "Last 20 checks — updates automatically.",
      live: "Live",
      neverChecked: "not checked yet",
      relativeTime: { now: "just now", sec: (n: number) => `${n}s ago`, min: (n: number) => `${n} min ago`, hour: (n: number) => `${n}h ago`, day: (n: number) => `${n}d ago` },
      tableDate: "When",
      tableStatus: "Status",
      tableSource: "Method",
      tablePrice: "Price",
      sourceDataLayer: "Site info",
      sourceAddToCart: "Buy button",
      sourceVariant: "Size detail",
      sourcePlaywright: "Full analysis",
      emptyCheckTitle: "Waiting for first check…",
      emptyCheckBody: "We'll check this product soon. Results will show up here.",
      lastCheck: "Checked",
      paused: "Paused",
      inStock: "In stock",
      outOfStock: "Out of stock",
      pending: "Pending",
      reactivated: "Alert back on",
      pausedToast: "Alert paused",
      actionFailed: "Couldn't do that",
      pause: "Pause",
      reactivate: "Resume",
      delete: "Delete",
      deleteTitle: "Delete this alert?",
      deleteDesc: "This is permanent. Your check history will be deleted too.",
      cancel: "Cancel",
      deleteForever: "Delete forever",
    },
    auth: {
      signIn: "Sign in",
      signUp: "Sign up",
      logout: "Sign out",
      orContinue: "or continue with",
      continueGoogle: "Continue with Google",
      continueApple: "Continue with Apple",
      email: "Email",
      password: "Password",
      passwordHint: "8 characters minimum.",
      emailPlaceholder: "alex@example.com",
      noAccount: "Don’t have an account yet?",
      haveAccount: "Already have an account?",
      forgotPassword: "Forgot your password?",
      forgotPasswordTitle: "Forgot your password",
      forgotPasswordSub: "Enter your email and we'll send you a reset link.",
      forgotPasswordSubmit: "Send reset link",
      forgotPasswordPending: "Sending…",
      forgotPasswordSuccessTitle: "Link sent",
      forgotPasswordSuccessBody:
        "If an account exists for this email, you'll receive a password reset link. Check your spam folder if you don't see it.",
      forgotPasswordBackToLogin: "Back to sign in",
      resetPasswordTitle: "New password",
      resetPasswordSub: "Choose a new password for your account.",
      resetPasswordNewPassword: "New password",
      resetPasswordSubmit: "Update password",
      resetPasswordPending: "Updating…",
      resetPasswordSuccess: "Password updated. Redirecting to sign in…",
      resetPasswordError: "This link is expired or already used. Request a new one.",
      signInTitle: "Welcome back.",
      signInSub: "Pick up the stock hunt where you left off.",
      signInSubmit: "Sign in",
      signInPending: "Signing in…",
      signUpTitle: "Create your account.",
      signUpSub: "Three minutes to never miss your size again.",
      signUpSubmit: "Create my account",
      signUpPending: "Creating…",
      checkEmailTitle: "Check your inbox",
      checkEmailBody:
        "We just sent a confirmation link to",
      checkEmailHint:
        "The link expires in 24h. Don’t forget to check spam.",
      notConfiguredTitle: "Opening soon",
      notConfiguredBody:
        "We’re putting on the finishing touches. Join the waitlist — we’ll let you know the moment we launch.",
      notConfiguredCta: "Join the waitlist",
      legalBlurb: "By continuing, you accept our terms and privacy policy.",
      onboarding: {
        stepLabel: (current: number, total: number) => `Step ${current}/${total}`,
        brandsTitle: "Which brands do you love?",
        brandsSub: "We'll watch their restocks for you",
        brandsContinue: "Continue",
        sizeTitle: "Your usual size?",
        sizeSub: "We'll pre-fill your alerts with it",
        sizeContinue: "Continue",
        nameTitle: "What should we call you?",
        nameSub: "To personalise your alerts",
        namePlaceholder: "Your first name",
        nameContinue: "Almost there",
        productTitle: "Got an item in mind?",
        productSub: "Paste the link of the one you missed — we'll set up your first alert",
        productPlaceholder: "https://www.zara.com/...",
        productSkip: "Skip for now",
        productInvalidUrl: "That link doesn't look right.",
        productCta: "Create alert",
        signupTitle: "Let's save this",
        signupSub: "So you don't lose your picks",
        successTitle: "All set!",
        successBody: "Check your inbox to confirm. Your first alert is waiting.",
        successCta: "Add my first alert",
      },
    },
  },
} as const;

export type AddWatchMessages = {
  urlLabel: string;
  urlHelp: string;
  urlPlaceholder: string;
  analyze: string;
  analyzing: string;
  blockedWarning: (brand: string) => string;
  limitedWarning: (brand: string) => string;
  modifyUrl: string;
  noImage: string;
  productName: string;
  productNamePlaceholder: string;
  size: string;
  color: string;
  oosBadge: string;
  selectVariant: string;
  selectVariantHelp: string;
  manualVariantPlaceholder: string;
  noVariantsHelp: string;
  cancel: string;
  activate: string;
  activating: string;
  enrichmentPending: string;
  partialAnalysis: string;
  couldNotRead: string;
  networkError: string;
  selectSizeColor: string;
  chooseVariant: string;
  limitReached: string;
  invalidUrl: string;
  createFailed: string;
  activated: string;
  progressHttp: string;
};

export type Messages = (typeof messages)[Locale];
