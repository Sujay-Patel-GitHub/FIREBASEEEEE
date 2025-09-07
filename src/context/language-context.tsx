'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import en from '@/locales/en';
import hi from '@/locales/hi';
import gu from '@/locales/gu';

const translations = { en, hi, gu };

type Language = keyof typeof translations;

type TranslationKey = keyof typeof en.sidebar | keyof typeof en.dashboard;


interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  showLanguageModal: boolean;
  setShowLanguageModal: (show: boolean) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('app-language') as Language;
    if (storedLanguage && translations[storedLanguage]) {
      setLanguageState(storedLanguage);
    } else {
      setShowLanguageModal(true);
    }
  }, []);

  const setLanguage = (langCode: Language) => {
    setLanguageState(langCode);
    localStorage.setItem('app-language', langCode);
    // Force a re-render of the root to update the html lang attribute
    document.documentElement.lang = langCode;
  };
  
  const t = useCallback((key: string): string => {
      const keys = key.split('.');
      let langObject = translations[language];
      
      try {
        let result: any = langObject;
        for (const k of keys) {
            result = result[k];
        }
        return result || key;
      } catch (error) {
        console.warn(`Translation for key "${key}" not found in language "${language}".`);
        return key;
      }

  }, [language]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
        document.documentElement.lang = language;
    }
  }, [language]);


  const value = {
    language,
    setLanguage,
    showLanguageModal,
    setShowLanguageModal,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
