import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import translations, { type Lang, type TranslationKeys } from "./translations";

interface LanguageContextType {
  lang: Lang;
  t: TranslationKeys;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("medicert_lang");
    return (saved === "es" ? "es" : "en") as Lang;
  });

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "es" : "en";
      localStorage.setItem("medicert_lang", next);
      return next;
    });
  }, []);

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
