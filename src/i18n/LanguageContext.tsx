import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type Language = 'ru' | 'en';

interface LanguageContextValue {
    language: Language;
    setLanguage: (lng: Language) => void;
    toggle: () => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'financier_lang';

function readInitial(): Language {
    if (typeof window === 'undefined') return 'ru';
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ru' || saved === 'en') return saved;
    const nav = (navigator.language || '').toLowerCase();
    return nav.startsWith('en') ? 'en' : 'ru';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { i18n } = useTranslation();
    const [language, setLanguageState] = useState<Language>(readInitial);

    useEffect(() => {
        if (i18n.language !== language) {
            i18n.changeLanguage(language);
        }
        localStorage.setItem(STORAGE_KEY, language);
        document.documentElement.setAttribute('lang', language);
    }, [language, i18n]);

    // Sync external i18n language changes (e.g., on login from prefs)
    useEffect(() => {
        const onChange = (lng: string) => {
            const norm: Language = lng && lng.startsWith('en') ? 'en' : 'ru';
            setLanguageState((prev) => (prev !== norm ? norm : prev));
        };
        i18n.on('languageChanged', onChange);
        return () => { i18n.off('languageChanged', onChange); };
    }, [i18n]);

    const setLanguage = useCallback((lng: Language) => setLanguageState(lng), []);
    const toggle = useCallback(
        () => setLanguageState((prev) => (prev === 'ru' ? 'en' : 'ru')),
        []
    );

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggle }}>
            {children}
        </LanguageContext.Provider>
    );
};

export function useLanguage(): LanguageContextValue {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
    return ctx;
}
