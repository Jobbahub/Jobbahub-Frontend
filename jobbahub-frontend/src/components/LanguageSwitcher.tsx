import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'nl' ? 'en' : 'nl');
    };

    return (
        <button
            onClick={toggleLanguage}
            className="theme-toggle" // Reusing the theme-toggle class for consistent round button style
            title={language === 'nl' ? "Switch to English" : "Schakel naar Nederlands"}
            aria-label="Switch language"
        >
            <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                {language === 'nl' ? 'NL' : 'EN'}
            </span>
        </button>
    );
};

export default LanguageSwitcher;
