import React, { useState } from 'react';

const About: React.FC = () => {
  const [activeTab, setActiveTab] = useState('about');

  const renderTabButton = (tabName: string, label: string) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`tab-btn ${activeTab === tabName ? 'active' : ''}`}
    >
      {label}
    </button>
  );

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <div className="page-hero">
        <h1 className="page-hero-title">About</h1>
      </div>

      <div className="about-wrapper" style={{ marginTop: '40px' }}>
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
              <h2 className="about-heading">About Jobbahub</h2>
              <p className="about-text">
                Jobbahub is een platform voor studenten om keuzemodules te vinden en te kiezen die passen bij hun interesses en studie.
              </p>
              <p className="about-text">
                Met Jobbahub kun je eenvoudig door verschillende modules bladeren, favorieten opslaan, en een vragenlijst invullen om gepersonaliseerde aanbevelingen te krijgen.
              </p>
            </div>
          )}

          {activeTab === 'casus' && (
            <div>
              <h2 className="about-heading">Casus</h2>
              <p className="about-text">
                Hier komt de casus beschrijving voor het project.
              </p>
            </div>
          )}

          {activeTab === 'userstories' && (
            <div>
              <h2 className="about-heading">User Stories</h2>
              <p className="about-text">
                Hier komen de user stories voor het project.
              </p>
            </div>
          )}

          {activeTab === 'wireframes' && (
            <div>
              <h2 className="about-heading">Wireframes</h2>
              <p className="about-text">
                Hier komen de wireframes voor het project.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default About;