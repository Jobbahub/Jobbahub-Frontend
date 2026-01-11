import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const About: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('about');

  const renderTabButton = (tabName: string, label: string) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`tab-btn ${activeTab === tabName ? 'active' : ''}`}
    >
      {t(label)}
    </button>
  );

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <div className="page-hero" style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/images/heroes/trees.jpg)`,
      }}>
        <h1 className="page-hero-title hero-title-shadow">{t("About")}</h1>
      </div>

      {/* Wrap about content in container */}
      <div className="container" style={{ marginTop: '40px' }}>
        <div className="about-wrapper">
          {/* Tab Navigation */}
          <div className="tab-container">
            {renderTabButton('about', 'About')}
            {renderTabButton('casus', 'Casus')}
            {renderTabButton('userstories', 'User stories')}
            {renderTabButton('wireframes', 'Wireframes')}
          </div>

          {/* Content Area */}
          <div className="about-content-box">
            {activeTab === 'about' && (
              <div>
                <h2 className="about-heading">{t("About Jobbahub")}</h2>
                <p className="about-text">
                  {t("Jobbahub is een platform voor studenten om keuzemodules te vinden en te kiezen die passen bij hun interesses en studie.")}
                </p>
                <p className="about-text">
                  {t("Met Jobbahub kun je eenvoudig door verschillende modules bladeren, favorieten opslaan, en een vragenlijst invullen om gepersonaliseerde aanbevelingen te krijgen.")}
                </p>
              </div>
            )}

            {activeTab === 'casus' && (
              <div>
                <h2 className="about-heading">{t("Casus")}</h2>
                <p className="about-text">
                  {t("Hier komt de casus beschrijving voor het project.")}
                </p>
              </div>
            )}

            {activeTab === 'userstories' && (
              <div>
                <h2 className="about-heading">{t("User Stories")}</h2>
                <p className="about-text">
                  {t("Hier komen de user stories voor het project.")}
                </p>
              </div>
            )}

            {activeTab === 'wireframes' && (
              <div>
                <h2 className="about-heading">{t("Wireframes")}</h2>
                <p className="about-text">
                  {t("Hier komen de wireframes voor het project.")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;