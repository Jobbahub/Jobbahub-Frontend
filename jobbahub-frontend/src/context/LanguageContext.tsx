import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { nl, en } from '../locales/translations';

type Language = 'nl' | 'en';

const dictionaries = {
    nl,
    en
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const savedLang = localStorage.getItem('app-language');
        return (savedLang === 'en' || savedLang === 'nl') ? savedLang : 'nl';
    });

    useEffect(() => {
        localStorage.setItem('app-language', language);
    }, [language]);

    const t = (key: string) => {
        const dict = dictionaries[language];
        // @ts-ignore
        return dict[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
