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
      <div className="page-hero">
        <h1 className="page-hero-title hero-title-shadow">{t("About")}</h1>
      </div>

      <div className="container about-container-spacing">
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
                <h2 className="about-heading">{t("Casus: Avans KeuzeKompas")}</h2>
                <p className="about-text casus-spacing">
                  <strong>{t("Aanleiding:")}</strong> {t("Binnen de Ambitie 2025 beweegt Avans Hogeschool naar modulair onderwijs. Studenten hebben hierbij de vrijheid om voor een aanzienlijk deel hun eigen koers te vallen via vrije keuzemodules (VKM). Met een aanbod van honderden modules is er behoefte aan een overzichtelijke student journey en betere begeleiding bij het maken van deze keuzes.")}
                </p>

                <p className="about-text casus-spacing">
                  <strong>{t("De Opdracht:")}</strong> {t("Het doel is de realisatie van een toegankelijke en gebruiksvriendelijke webapplicatie die bachelorstudenten ondersteunt bij het oriënteren op en kiezen van deze modules. De focus ligt hierbij op het 'intern kompas': het maken van keuzes op basis van persoonlijke interesses, doelen en waarden.")}
                </p>

                <h3 className="about-subheading casus-list-title">
                  {t("Kernfunctionaliteiten en Eisen:")}
                </h3>
                <ul className="about-list casus-list-padding">
                  <li className="about-text list-item-spacing">
                    {t("Ondersteuning van het keuzeproces door inzicht te geven in het intern kompas.")}
                  </li>
                  <li className="about-text list-item-spacing">
                    {t("Toegang tot het volledige aanbod van vrije keuzemodules met uitgebreide filtermogelijkheden (zoals vakgebied, locatie en tijdsinvestering).")}
                  </li>
                  <li className="about-text list-item-spacing">
                    {t("Inzet van AI om gepersonaliseerde aanbevelingen te doen die aansluiten bij het profiel van de student.")}
                  </li>
                  <li className="about-text list-item-spacing">
                    {t("Onderdeel van blended begeleiding: een naadloze combinatie van de digitale tool en persoonlijke gesprekken met de studieloopbaanbegeleider.")}
                  </li>
                </ul>
              </div>
            )}

            {activeTab === 'userstories' && (
              <div>
                <h2 className="about-heading">{t("User Stories & Requirements")}</h2>
                <p className="about-text story-intro-spacing">
                  {t("Voor de ontwikkeling van het KeuzeKompas zijn de volgende user stories en kwaliteitseisen gedefinieerd om de functionaliteit en herbruikbaarheid te waarborgen.")}
                </p>

                <div className="user-stories-container">
                  <div className="user-story-item">
                    <h3 className="about-subheading bold">1. {t("Modules Opslaan (Shortlist)")}</h3>
                    <p className="about-text italic">{t("Als student wil ik favoriete modules kunnen opslaan in een shortlist, zodat ik ze later gemakkelijk kan terugvinden.")}</p>
                    <ul className="about-list story-list-style">
                      <li>{t("Ingelogde gebruikers kunnen modules markeren als favoriet via de backend API.")}</li>
                      <li>{t("De shortlist toont een overzicht van alle opgeslagen modules.")}</li>
                      <li>{t("Modules kunnen eenvoudig uit de shortlist worden verwijderd.")}</li>
                      <li>{t("Niet-ingelogde gebruikers worden gevraagd in te loggen voor deze functie.")}</li>
                    </ul>
                  </div>

                  <div className="user-story-item">
                    <h3 className="about-subheading bold">2. {t("Suggesties op basis van Profiel")}</h3>
                    <p className="about-text italic">{t("Als student wil ik suggesties ontvangen op basis van een vragenlijst die aansluit bij mijn doelen.")}</p>
                    <ul className="about-list story-list-style">
                      <li>{t("Nieuwe gebruikers krijgen een uitnodiging voor de vragenlijst op de homepagina.")}</li>
                      <li>{t("Antwoorden worden opgeslagen in de profielinformatie voor gepersonaliseerde AI-matching.")}</li>
                      <li>{t("Gebruikers kunnen hun profiel resetten om de vragenlijst opnieuw in te vullen.")}</li>
                      <li>{t("De suggestiesectie toont alleen relevante modules na voltooiing van het profiel.")}</li>
                    </ul>
                  </div>

                  <div className="user-story-item">
                    <h3 className="about-subheading bold">3. {t("Module Overzicht")}</h3>
                    <p className="about-text italic">{t("Als student wil ik een overzicht zien van alle beschikbare modules om een eerste selectie te maken.")}</p>
                    <ul className="about-list story-list-style">
                      <li>{t("Alle modules worden via een API-call opgehaald en getoond in de frontend.")}</li>
                      <li>{t("Het systeem toont een duidelijke melding als er geen modules beschikbaar zijn.")}</li>
                      <li>{t("De interface is getest met diverse datasets (leeg, enkel, en veel modules).")}</li>
                    </ul>
                  </div>

                  <div className="user-story-item">
                    <h3 className="about-subheading bold">4. {t("Detailinformatie (Popup)")}</h3>
                    <p className="about-text italic">{t("Als student wil ik details inzien zoals leeruitkomsten en instapvoorwaarden in een overzichtelijke popup.")}</p>
                    <ul className="about-list story-list-style">
                      <li>{t("Bij het klikken op een module opent een popup met specifieke gegevens uit de backend.")}</li>
                      <li>{t("Informatie bevat o.a.: Inhoud, Leeruitkomsten, Locatie en ECTS.")}</li>
                    </ul>
                  </div>

                  <div className="user-story-item">
                    <h3 className="about-subheading bold">5. {t("Zoeken en Filteren")}</h3>
                    <p className="about-text italic">{t("Als student wil ik kunnen zoeken en filteren op thema om snel relevante opties te vinden.")}</p>
                    <ul className="about-list story-list-style">
                      <li>{t("Zoekbalk aanwezig voor trefwoorden en filters voor specifieke modulethema's.")}</li>
                      <li>{t("De lijst wordt direct bijgewerkt op basis van actieve filters en zoektermen.")}</li>
                    </ul>
                  </div>
                </div>
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