import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Home: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <div className="home-hero">
        <h1 className="home-hero-title hero-title-shadow">
          {t("HOME PAGE")}
        </h1>
      </div>

      {/* Subtitle */}
      <div className="home-subtitle-container">
        <h2 className="home-subtitle">
          {t("home_subtitle")}
        </h2>
      </div>

      {/* Main Content Area */}
      <div className="home-content">
        <p className="text-paragraph">
          {t("home_intro")}
        </p>
      </div>
    </div>
  );
};

export default Home;