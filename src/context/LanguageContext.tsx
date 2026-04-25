import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Language } from '../types';
import en from '../translations/en.json';
import hi from '../translations/hi.json';
import kn from '../translations/kn.json';
import ta from '../translations/ta.json';
import te from '../translations/te.json';
import ml from '../translations/ml.json';
import mr from '../translations/mr.json';
import bn from '../translations/bn.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslationDict = Record<string, any>;

const translations: Record<Language, TranslationDict> = { en, hi, kn, ta, te, ml, mr, bn };

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी',
  kn: 'ಕನ್ನಡ',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  ml: 'മലയാളം',
  mr: 'मराठी',
  bn: 'বাংলা',
};

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (p) => p,
});

function getNestedValue(obj: TranslationDict, path: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = path.split('.').reduce((acc: any, key: string) => acc?.[key], obj);
  return typeof result === 'string' ? result : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('sw_lang') as Language) || 'en';
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('sw_lang', l);
  };

  const t = (path: string): string => {
    return getNestedValue(translations[lang], path) || getNestedValue(translations['en'], path) || path;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
