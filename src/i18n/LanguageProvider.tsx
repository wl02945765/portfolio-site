"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { dictionaries, type Dictionary, type Locale } from "./dictionaries";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "ching-profile-locale";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    // Some mobile in-app browsers (LINE, Instagram, FB Messenger) restrict
    // localStorage and throw on access instead of just no-op'ing — the same
    // failure mode already found and fixed for sessionStorage in
    // IntroLoader. This runs at the root of every page, so an uncaught
    // throw here would take the whole app down on every visit from one of
    // those apps. Fail safe: just keep the default locale.
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "zh" || saved === "en") {
        setLocaleState(saved);
      }
    } catch {
      // ignore — default locale stands
    }
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Same restriction as above, triggered from the nav bar's language
      // toggle instead of on mount. The language still switches for this
      // visit — it just won't be remembered next time.
    }
  };

  return (
    <LanguageContext.Provider
      value={{ locale, setLocale, t: dictionaries[locale] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
