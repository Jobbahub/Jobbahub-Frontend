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
    <div>
      {/* Tab Navigation */}
      <div className="tab-container">
        {renderTabButton('about', 'About')}
        {renderTabButton('casus', 'Casus')}
        {renderTabButton('userstories', 'User stories')}
        {renderTabButton('wireframe1', 'Wireframe 1')}
        {renderTabButton('wireframe2', 'Wireframe 2')}
        {renderTabButton('wireframe3', 'Wireframe 3')}
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

        {activeTab.startsWith('wireframe') && (
          <div>
            <h2 className="about-heading">
              {activeTab === 'wireframe1' ? 'Wireframe 1' : 
               activeTab === 'wireframe2' ? 'Wireframe 2' : 'Wireframe 3'}
            </h2>
            <p className="about-text">
              Hier komt {activeTab === 'wireframe1' ? 'Wireframe 1' : 
                          activeTab === 'wireframe2' ? 'Wireframe 2' : 'Wireframe 3'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default About;