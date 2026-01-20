import { useState, useEffect, useCallback } from "react";

const DEFAULT_LOCALE = "es";
const STORAGE_KEY = "pokedleplus:locale";

import es from "../locales/es.json";
import en from "../locales/en.json";

const locales = {
  es,
  en,
};

function detectBrowserLanguage() {
  const lang = navigator.language || navigator.userLanguage || "es";
  return lang.startsWith("es") ? "es" : "en";
}

export function useI18n() {
  const [locale, setLocaleState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && locales[stored]) {
      return stored;
    }
    return detectBrowserLanguage();
  });

  const [translations, setTranslations] = useState(locales[locale]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    setTranslations(locales[locale]);
  }, [locale]);

  const t = useCallback(
    (key) => {
      const keys = key.split(".");
      let value = translations;
      for (const k of keys) {
        if (value && typeof value === "object") {
          value = value[k];
        }
      }
      return value || key;
    },
    [translations],
  );

  const changeLocale = useCallback((newLocale) => {
    if (locales[newLocale]) {
      setLocaleState(newLocale);
    }
  }, []);

  return { t, locale, changeLocale, availableLocales: Object.keys(locales) };
}
