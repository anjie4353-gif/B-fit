"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import type { AppLanguage } from "@/types";
import { getDictionary, tPath } from "@/lib/i18n";
import type { TranslationDict } from "@/lib/i18n/types";
import { useUserStore } from "@/hooks/useUserStore";

interface I18nContextValue {
  language: AppLanguage;
  dict: TranslationDict;
  setLanguage: (lang: AppLanguage) => void;
  t: (path: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const storedLang = useUserStore((s) => s.language);
  const setStoredLanguage = useUserStore((s) => s.setLanguage);
  const [language, setLanguageState] = useState<AppLanguage>(storedLang ?? "en");

  useEffect(() => {
    if (storedLang) setLanguageState(storedLang);
  }, [storedLang]);

  const setLanguage = useCallback(
    (lang: AppLanguage) => {
      setLanguageState(lang);
      setStoredLanguage(lang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = lang;
      }
    },
    [setStoredLanguage]
  );

  const dict = useMemo(() => getDictionary(language), [language]);

  const t = useCallback((path: string) => tPath(dict, path), [dict]);

  const value = useMemo(
    () => ({ language, dict, setLanguage, t }),
    [language, dict, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    const dict = getDictionary("en");
    return {
      language: "en" as AppLanguage,
      dict,
      setLanguage: () => undefined,
      t: (path: string) => tPath(dict, path),
    };
  }
  return ctx;
}