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
    dashboard: {
      greeting: (name: string | null) => name ? `Salut ${name}` : "Mes alertes",
      addAlert: "Ajouter une alerte",
      upgradeToPro: "Passer à Pro",
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
            "We parse the e-commerce dataLayer, the state of the Add-to-Cart button, and variant attributes. Playwright as fallback for stubborn SPAs. Each signal is scored independently to prevent false positives from triggering an alert.",
        },
        {
          title: "Double confirmation",
          body:
            "A variant must be detected IN_STOCK twice in a row before triggering an alert. That means if an item comes back for 30 seconds due to an abandoned cart, we won't wake you up at 3am. No more ghost alerts.",
        },
        {
          title: "Retailer-friendly",
          body:
            "Public reads only, no aggressive scraping, clean user-agent rotation, max 1 request at a time per domain. We read the same page you see, at human speed. We never bypass authentication and never automate purchases.",
        },
        {
          title: "Hosted in Europe",
          body:
            "Data stored in Frankfurt (Supabase EU), encrypted at rest and in transit. GDPR compliant. Your email and watch URLs belong to you — exportable or deletable in one click. We never cross-reference your data with ad networks or third parties.",
        },
        {
          title: "Email and SMS alerts",
          body:
            "Instant email with a direct link to the product page pre-filled with your size. Optional SMS on the Pro plan for highly competitive drops. Each alert includes the product name, size, colour, price, and a one-click purchase link. No disguised newsletter.",
        },
      ],
      whyTitle: "Why restocking over a brand's own alert?",
      whyItems: [
        {
          title: "Speed",
          body:
            "Brands send their native alerts in batches — often 2 to 24 hours after the actual restock. We check each product individually, no queue. Median measured: 2 min 40 on the Pro plan.",
        },
        {
          title: "Size-specific",
          body:
            "Brands send a generic product alert, not your size. If size S comes back and you wear M, you get a useless notification. Restocking only pings you for the exact variant you're watching.",
        },
        {
          title: "Multi-brand, one dashboard",
          body:
            "No need to create accounts at Zara, COS, Sézane and pray their alerts work. One dashboard, all your brands, all your sizes.",
        },
      ],
    },
    retailers: {
      eyebrow: "Universal coverage",
      title: "Any URL. We’ve got it.",
      sub:
        "Restocking isn’t limited to a list. We watch any fashion store in Europe. The brands below are simply the ones we’ve optimized for maximum speed and precision.",
      legendInStock: "Optimized (High-Speed)",
      legendBeta: "Universal support",
      filterAll: "All brands",
      filterLive: "Optimized",
      filterBeta: "Universal",
      tileCta: "Watch this store",
      requestTitle: "A stubborn store?",
      requestBody:
        "Our bot learns fast. If a site doesn't seem to work, let us know and we’ll optimize it as a priority.",
      requestCta: "Report a complex site",
      noResultsTitle: "No matching filter.",
      noResultsBody: "But remember: any URL works!",
      universalCardTitle: "Universal Bot",
      universalCardBody: "Paste any link. Our engine analyzes the structure in real-time to find your size.",
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
        {
          q: "Which stores do you monitor?",
          a:
            "Zara, COS, Aritzia, Uniqlo, Sézane, Mango, Arket, ASOS, Ganni, Massimo Dutti, & Other Stories and 50+ more at launch. Every brand listed on our Stores page is covered — with optimized parsers for the first 23. The rest go through our universal bot which detects structure in real-time.",
        },
        {
          q: "How does it work technically?",
          a:
            "Our worker scrapes the product page every 5 minutes (Pro) or 30 minutes (Free). We use four cascading strategies: reading the e-commerce dataLayer, inspecting the Add-to-Cart button state, checking variant attributes, and text analysis of the page. For complex sites, we fall back to a headless browser (Playwright). No bulk data harvesting — only the specific product you follow.",
        },
        {
          q: "Why are your alerts faster than the brand’s own?",
          a:
            "Brands send their native alerts in batches — often 2 to 24 hours after the actual restock. We check each product individually, continuously. When your item comes back, you know within a minute. It’s not magic, it’s just that we’re not queuing in the brand’s batch email system.",
        },
        {
          q: "How many products can I track?",
          a:
            "3 on the Free plan, 20 on Pro. Each variant (size + colour) counts as one product. If you want to track the same t-shirt in S and M, that’s 2 slots. You can swap your active alerts anytime from the dashboard.",
        },
        {
          q: "Do you support non-European stores?",
          a:
            "Our focus is Europe, but we already monitor some North American brands (Aritzia, Reformation, Khaite). If the site is in English or French and the product has a public page, it should work. Tell us which brand you’re missing on our Stores page — we prioritise the most requested within 2 weeks.",
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
        "We started this after missing a COS coat for the third time. Size S, navy blue. Came back at 4am, gone by 4:07. No alert received. That’s when we knew the system was broken.",
        "Today our engine scans product pages from 120+ brands every 5 minutes. We read the e-commerce dataLayer, the Add-to-Cart button state, the variant attributes — nothing magical, just solid engineering. Without pissing off retailers.",
        "We don’t spam you. We don’t sell you. We ping you when it’s truly back, in your size, for the product you want. Full stop. No false positives thanks to double confirmation.",
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
      settingsTitle: "Settings",
      settingsSub: "Account, security and notifications.",
      preferencesTitle: "Preferences",
      preferencesSub: "Your brands and usual size help us serve you better.",
      changeEmailTitle: "Change email",
      changeEmailDesc: "A confirmation email will be sent to the new address. Your old email stays active until confirmed.",
      newEmailLabel: "New email",
      changeEmailButton: "Change email",
      changeEmailPending: "Sending…",
      changeEmailSuccess: "Confirmation email sent. Check your new inbox.",
      changePasswordTitle: "Change password",
      changePasswordDesc: "8 characters minimum.",
      currentPasswordLabel: "Current password",
      newPasswordLabel: "New password",
      confirmPasswordLabel: "Confirm password",
      changePasswordButton: "Change password",
      changePasswordPending: "Changing…",
      changePasswordSuccess: "Password updated.",
      passwordMismatch: "Passwords don't match.",
      passwordTooShort: "8 characters minimum.",
      saveButton: "Save",
      saving: "Saving…",
      saved: "Saved!",
      saveError: "Error saving.",
    },
    dashboard: {
      greeting: (name: string | null) => name ? `Welcome back, ${name}` : "My alerts",
      addAlert: "Add an alert",
      upgradeToPro: "Go Pro",
      stats: {
        activeAlerts: "Active alerts",
        paused: (n: number) => `${n} paused`,
        inStock: "In stock",
        inStockSub: "Right now",
        lastCheck: "Last check",
        workerActive: "Worker active",
        plan: "Plan",
        manage: "Manage →",
      },
      limitReached: "Limit reached",
      limitBody: (active: number, plan: string, max: number) =>
        `You have ${active} active alerts on your ${plan} plan (max ${max}). Upgrade to Pro for 20 alerts and checks every 5 minutes.`,
      emptyTitle: (name: string | null) => name ? `Ready to hunt, ${name}?` : "Ready to start?",
      emptyBody: "Paste the URL of a product you missed, pick your size, and we'll handle the rest.",
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
      noImage: "No image",
      untitled: "Untitled product",
      variant: "Variant",
      price: "Price",
      createdAt: "Created",
      checkHistory: "Check history",
      checkHistoryDesc: "Last 20 checks — auto-refreshes every 20s.",
      live: "Live",
      neverChecked: "never checked",
      relativeTime: { now: "just now", sec: (n: number) => `${n}s ago`, min: (n: number) => `${n} min ago`, hour: (n: number) => `${n}h ago`, day: (n: number) => `${n}d ago` },
      tableDate: "Date",
      tableStatus: "Status",
      tableSource: "Source",
      tablePrice: "Price",
      sourceDataLayer: "Page code",
      sourceAddToCart: "Buy button",
      sourceVariant: "Size detail",
      sourcePlaywright: "Full analysis",
      emptyCheckTitle: "Waiting for first check…",
      emptyCheckBody: "The worker will analyze this product soon. Results will appear here automatically.",
      lastCheck: "Last check",
      paused: "Paused",
      inStock: "In stock",
      outOfStock: "Out of stock",
      pending: "Pending",
      reactivated: "Alert reactivated",
      pausedToast: "Alert paused",
      actionFailed: "Action failed",
      pause: "Pause",
      reactivate: "Reactivate",
      delete: "Delete",
      deleteTitle: "Delete this alert?",
      deleteDesc: "This action is irreversible. The check history will also be deleted.",
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
      notConfiguredTitle: "Auth launching soon",
      notConfiguredBody:
        "We’re finalising authentication configuration. In the meantime, join the waitlist — we’ll write the moment we open.",
      notConfiguredCta: "Join the waitlist",
      legalBlurb: "By continuing, you accept our terms and privacy policy.",
      onboarding: {
        stepLabel: (current: number, total: number) => `Step ${current}/${total}`,
        brandsTitle: "Which brands do you follow?",
        brandsSub: "We'll watch their restocks for you",
        brandsContinue: "Continue",
        sizeTitle: "Your usual size?",
        sizeSub: "We'll pre-fill your future alerts with it",
        sizeContinue: "Continue",
        nameTitle: "What should we call you?",
        nameSub: "To personalise your alerts",
        namePlaceholder: "Your first name",
        nameContinue: "Almost done",
        productTitle: "Got a product in mind?",
        productSub: "Paste the link of the item you missed — we'll create your first alert",
        productPlaceholder: "https://www.zara.com/...",
        productSkip: "Skip for now",
        productInvalidUrl: "Invalid URL. Check the link.",
        productCta: "Create alert",
        signupTitle: "Let's save this",
        signupSub: "So you don't lose your preferences",
        successTitle: "All set!",
        successBody: "Check your inbox to confirm. Your first alert is waiting.",
        successCta: "Add my first alert",
      },
    },
  },
} as const;

export type Messages = (typeof messages)[Locale];
