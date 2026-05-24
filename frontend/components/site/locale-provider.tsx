"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  messages,
  type Locale,
  type Messages,
} from "@/lib/i18n/messages";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Messages;
  toggle: () => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "restocking.locale";

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (initialLocale) return; // Server already set the locale
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored && LOCALES.includes(stored)) {
        setLocaleState(stored);
        return;
      }
      const nav = window.navigator.language?.toLowerCase() ?? "";
      if (nav.startsWith("fr")) setLocaleState("fr");
      else setLocaleState("en");
    } catch {
      // ignore
    }
  }, [initialLocale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.setAttribute("lang", l);
    } catch {
      // ignore
    }
  }, []);

  const toggle = useCallback(() => {
    setLocale(locale === "fr" ? "en" : "fr");
  }, [locale, setLocale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      toggle,
      t: messages[locale],
    }),
    [locale, setLocale, toggle],
  );

  return (
    <LocaleContext.Provider value={value}>
      {/* Render with default locale on server, swap to user locale after mount to avoid hydration flash */}
      <div data-mounted={mounted ? "true" : "false"} className="contents">
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}
