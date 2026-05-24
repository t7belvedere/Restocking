import * as Localization from "expo-localization";
import { createContext, useContext, useState, type ReactNode } from "react";

type Locale = "fr" | "en";

const translations = {
  fr: {
    dashboard: "Tableau de bord",
    addWatch: "Ajouter",
    settings: "Paramètres",
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
    signOut: "Déconnexion",
    pasteUrl: "Colle l'URL de ton article",
    selectSize: "Choisis ta taille",
    createAlert: "Créer l'alerte",
    inStock: "En stock",
    outOfStock: "Rupture",
    checking: "Vérification…",
    freePlan: "Gratuit",
    proPlan: "Pro",
    upgrade: "Passer à Pro",
    manageSubscription: "Gérer l'abonnement",
    language: "Langue",
    account: "Compte",
    noWatches: "Aucune alerte pour le moment",
    noWatchesDesc: "Ajoute ton premier article à surveiller !",
    urlPlaceholder: "https://www.zara.com/fr/...",
    enrichmentMessage:
      "Le site bloque l'extraction automatique. L'alerte sera créée et les détails ajoutés automatiquement.",
    emailSent:
      "Email envoyé ! Vérifie ta boîte de réception pour le lien de réinitialisation.",
    checkEmail:
      "Vérifie ta boîte mail pour confirmer ton inscription.",
  },
  en: {
    dashboard: "Dashboard",
    addWatch: "Add",
    settings: "Settings",
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
    signOut: "Sign out",
    pasteUrl: "Paste your product URL",
    selectSize: "Select your size",
    createAlert: "Create alert",
    inStock: "In stock",
    outOfStock: "Out of stock",
    checking: "Checking…",
    freePlan: "Free",
    proPlan: "Pro",
    upgrade: "Upgrade to Pro",
    manageSubscription: "Manage subscription",
    language: "Language",
    account: "Account",
    noWatches: "No alerts yet",
    noWatchesDesc: "Add your first item to watch!",
    urlPlaceholder: "https://www.zara.com/en/...",
    enrichmentMessage:
      "The site blocks automatic extraction. Your alert will be created and details added automatically.",
    emailSent:
      "Email sent! Check your inbox for the reset link.",
    checkEmail:
      "Check your email to confirm your registration.",
  },
};

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
  const deviceLocale = Localization.getLocales?.()?.[0]?.languageCode ?? "fr";
  const initialLocale: Locale =
    deviceLocale === "en" ? "en" : "fr";

  const [locale, setLocale] = useState<Locale>(initialLocale);

  const t = translations[locale];

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
