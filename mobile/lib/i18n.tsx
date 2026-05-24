import { createContext, useContext, useState, type ReactNode } from "react";
import { Platform } from "react-native";

type Locale = "fr" | "en";

const translations = {
  fr: {
    dashboard: "Tableau de bord",
    addWatch: "Ajouter",
    settings: "Paramètres",
    profileTitle: "Profil & préférences",
    login: "Connexion",
    register: "Inscription",
    email: "Email",
    password: "Mot de passe",
    forgotPassword: "Mot de passe oublié ?",
    sendReset: "Envoyer le lien",
    noAccount: "Pas encore de compte ?",
    hasAccount: "Déjà un compte ?",
    signUp: "S'inscrire",
    signIn: "Se connecter",
    welcomeBack: "Bon retour.",
    loginSubtitle: "Connecte-toi pour gérer tes alertes.",
    googleContinue: "Continuer avec Google",
    orContinueWith: "ou continue avec",
    createAccount: "Crée ton compte.",
    registerSubtitle: "Commence à surveiller tes articles préférés.",
    checkEmailTitle: "Vérifie ta boîte mail",
    emailSentTitle: "Email envoyé !",
    back: "Retour",
    forgotPasswordTitle: "Mot de passe oublié ?",
    forgotPasswordSubtitle:
      "Entre ton email pour recevoir un lien de réinitialisation.",
    signOut: "Déconnexion",
    signOutConfirm: "Es-tu sûr(e) ?",
    cancel: "Annuler",
    pasteUrl: "Colle l'URL de ton article",
    selectSize: "Choisis ta taille",
    createAlert: "Créer l'alerte",
    inStock: "En stock",
    outOfStock: "Rupture",
    checking: "Vérification…",
    freePlan: "Gratuit",
    proPlan: "Pro",
    upgrade: "Passer à Pro",
    manageSubscription: "Gérer",
    language: "Langue",
    account: "Compte",
    subscription: "Abonnement",
    noWatches: "Aucune alerte pour le moment",
    noWatchesDesc: "Ajoute ton premier article à surveiller !",
    urlPlaceholder: "https://www.zara.com/fr/...",
    enrichmentMessage:
      "Le site bloque l'extraction automatique. L'alerte sera créée et les détails ajoutés automatiquement.",
    emailSent:
      "Email envoyé ! Vérifie ta boîte de réception pour le lien de réinitialisation.",
    checkEmail: "Vérifie ta boîte mail pour confirmer ton inscription.",
    notifications: "Notifications",
    notificationsEmail: "Email",
    notificationsEmailDesc: "Alertes de stock par email",
    notificationsSms: "SMS / Téléphone",
    notificationsSmsDesc: "Alertes de stock par SMS",
    verifyPhone: "Vérifier",
    verified: "Vérifié",
    preferences: "Préférences",
    firstName: "Prénom",
    firstNamePlaceholder: "Ton prénom",
    defaultSize: "Taille par défaut",
    preferredBrands: "Marques préférées",
    dangerZone: "Zone de danger",
    deleteAccount: "Supprimer mon compte",
    deleteAccountTitle: "Supprimer le compte ?",
    deleteAccountMessage:
      "Toutes tes données seront définitivement supprimées. Cette action est irréversible.",
    deleteConfirm: "Supprimer",
    // Dashboard
    greeting: "Bonjour",
    activeAlerts: "Alertes actives",
    inStockCount: "En stock",
    lastCheck: "Dernière vérif",
    planLabel: "Abonnement",
    addAlert: "Ajouter une alerte",
    myAlerts: "Mes alertes",
    readyToStart: "Prêt à commencer ?",
    readyToStartDesc:
      "Ajoute ton premier article à surveiller. On t'envoie une alerte dès qu'il est de nouveau disponible.",
    renewalOn: "Renouvellement le",
    activeSubscription: "Abonnement actif",
    dangerZoneDesc:
      "Une fois supprimées, toutes tes données seront définitivement effacées. Cette action est irréversible.",
    // Add screen
    pasteProductUrl: "Colle l'URL du produit que tu veux surveiller",
    manualSize: "Taille manuelle",
    analyzeProduct: "Analyser le produit",
    noImage: "Pas d'image",
    activateAlert: "Activer l'alerte",
    alertActiveDesc: "Ton alerte est active. Tu seras notifié dès que le produit sera de retour en stock.",
    addAnother: "Ajouter un autre",
    seeMyAlerts: "Voir mes alertes",
    // Watch detail
    watchDetail: "Détail de l'alerte",
    pause: "Mettre en pause",
    reactivate: "Réactiver",
    deleteWatch: "Supprimer",
    deleteWatchTitle: "Supprimer l'alerte ?",
    deleteWatchMessage: "Cette action est irréversible. L'historique sera perdu.",
    checkLog: "Historique des vérifications",
    pendingFirstCheck: "En attente du premier check…",
    notFound: "Produit introuvable",
    variant: "Variante",
    price: "Prix",
    lastChecked: "Dernier check",
    paused: "En pause",
    waiting: "En attente",
    alertCreated: "Alerte créée !",
    freePlanDesc: "3 alertes actives max",
  },
  en: {
    dashboard: "Dashboard",
    addWatch: "Add",
    settings: "Settings",
    profileTitle: "Profile & preferences",
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot password?",
    sendReset: "Send reset link",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    signUp: "Sign up",
    signIn: "Sign in",
    welcomeBack: "Welcome back.",
    loginSubtitle: "Log in to manage your alerts.",
    googleContinue: "Continue with Google",
    orContinueWith: "or continue with",
    createAccount: "Create your account.",
    registerSubtitle: "Start watching your favorite items.",
    checkEmailTitle: "Check your email",
    emailSentTitle: "Email sent!",
    back: "Back",
    forgotPasswordTitle: "Forgot password?",
    forgotPasswordSubtitle:
      "Enter your email to receive a reset link.",
    signOut: "Sign out",
    signOutConfirm: "Are you sure?",
    cancel: "Cancel",
    pasteUrl: "Paste your product URL",
    selectSize: "Select your size",
    createAlert: "Create alert",
    inStock: "In stock",
    outOfStock: "Out of stock",
    checking: "Checking…",
    freePlan: "Free",
    proPlan: "Pro",
    upgrade: "Upgrade to Pro",
    manageSubscription: "Manage",
    language: "Language",
    account: "Account",
    subscription: "Subscription",
    noWatches: "No alerts yet",
    noWatchesDesc: "Add your first item to watch!",
    urlPlaceholder: "https://www.zara.com/en/...",
    enrichmentMessage:
      "The site blocks automatic extraction. Your alert will be created and details added automatically.",
    emailSent: "Email sent! Check your inbox for the reset link.",
    checkEmail: "Check your email to confirm your registration.",
    notifications: "Notifications",
    notificationsEmail: "Email",
    notificationsEmailDesc: "Stock alerts via email",
    notificationsSms: "SMS / Phone",
    notificationsSmsDesc: "Stock alerts via SMS",
    verifyPhone: "Verify",
    verified: "Verified",
    preferences: "Preferences",
    firstName: "First name",
    firstNamePlaceholder: "Your first name",
    defaultSize: "Default size",
    preferredBrands: "Preferred brands",
    dangerZone: "Danger zone",
    deleteAccount: "Delete my account",
    deleteAccountTitle: "Delete account?",
    deleteAccountMessage:
      "All your data will be permanently deleted. This action is irreversible.",
    deleteConfirm: "Delete",
    // Dashboard
    greeting: "Hello",
    activeAlerts: "Active alerts",
    inStockCount: "In stock",
    lastCheck: "Last check",
    planLabel: "Plan",
    addAlert: "Add an alert",
    myAlerts: "My alerts",
    readyToStart: "Ready to start?",
    readyToStartDesc:
      "Add your first item to watch. We'll notify you as soon as it's back in stock.",
    renewalOn: "Renews on",
    activeSubscription: "Active subscription",
    dangerZoneDesc:
      "Once deleted, all your data will be permanently erased. This action is irreversible.",
    // Add screen
    pasteProductUrl: "Paste the product URL to track",
    manualSize: "Manual size",
    analyzeProduct: "Analyze product",
    noImage: "No image",
    activateAlert: "Activate alert",
    alertActiveDesc: "Your alert is active. You'll be notified as soon as the product is back in stock.",
    addAnother: "Add another",
    seeMyAlerts: "View my alerts",
    // Watch detail
    watchDetail: "Alert detail",
    pause: "Pause",
    reactivate: "Reactivate",
    deleteWatch: "Delete",
    deleteWatchTitle: "Delete alert?",
    deleteWatchMessage: "This action is irreversible. Check history will be lost.",
    checkLog: "Check history",
    pendingFirstCheck: "Waiting for first check…",
    notFound: "Product not found",
    variant: "Variant",
    price: "Price",
    lastChecked: "Last check",
    paused: "Paused",
    waiting: "Waiting",
    alertCreated: "Alert created!",
    freePlanDesc: "3 active alerts max",
  },
};

function getDeviceLocale(): Locale {
  if (Platform.OS === "web") {
    const lang = navigator.language;
    return lang.startsWith("en") ? "en" : "fr";
  }
  try {
    const Localization = require("expo-localization");
    const code = Localization.getLocales?.()?.[0]?.languageCode ?? "fr";
    return code === "en" ? "en" : "fr";
  } catch {
    return "fr";
  }
}

type I18nContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: typeof translations.fr;
};

const I18nContext = createContext<I18nContextType>({
  locale: "fr",
  setLocale: () => {},
  t: translations.fr,
});

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const initialLocale = getDeviceLocale();
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const t = translations[locale];

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
