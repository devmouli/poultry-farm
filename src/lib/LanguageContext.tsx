'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dict } from './translations';

export type Locale = keyof typeof dict;

interface LanguageContextType {
    locale: Locale;
    setLocale: (lang: Locale) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [locale, setLocaleState] = useState<Locale>('en');

    useEffect(() => {
        const saved = localStorage.getItem('app_lang') as Locale;
        if (saved && dict[saved]) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (lang: Locale) => {
        localStorage.setItem('app_lang', lang);
        setLocaleState(lang);
    };

    const t = (key: string): string => {
        const translations = dict[locale] as Record<string, string>;
        return translations[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
