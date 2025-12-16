import React, { useState } from 'react';

const About: React.FC = () => {
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0',
        borderBottom: '2px solid #e5e7eb',
        marginBottom: '30px'
      }}>
        <button
          onClick={() => setActiveTab('about')}
          style={{
            padding: '15px 30px',
            background: activeTab === 'about' ? 'white' : '#f3f4f6',
            border: 'none',
            borderBottom: activeTab === 'about' ? '3px solid #C8102E' : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'about' ? 'bold' : 'normal',
            color: activeTab === 'about' ? '#C8102E' : '#6b7280',
            transition: 'all 0.2s'
          }}
        >
          About
        </button>
        <button
          onClick={() => setActiveTab('casus')}
          style={{
            padding: '15px 30px',
            background: activeTab === 'casus' ? 'white' : '#f3f4f6',
            border: 'none',
            borderBottom: activeTab === 'casus' ? '3px solid #C8102E' : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'casus' ? 'bold' : 'normal',
            color: activeTab === 'casus' ? '#C8102E' : '#6b7280',
            transition: 'all 0.2s'
          }}
        >
          Casus
        </button>
        <button
          onClick={() => setActiveTab('userstories')}
          style={{
            padding: '15px 30px',
            background: activeTab === 'userstories' ? 'white' : '#f3f4f6',
            border: 'none',
            borderBottom: activeTab === 'userstories' ? '3px solid #C8102E' : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'userstories' ? 'bold' : 'normal',
            color: activeTab === 'userstories' ? '#C8102E' : '#6b7280',
            transition: 'all 0.2s'
          }}
        >
          User stories
        </button>
        <button
          onClick={() => setActiveTab('wireframe1')}
          style={{
            padding: '15px 30px',
            background: activeTab === 'wireframe1' ? 'white' : '#f3f4f6',
            border: 'none',
            borderBottom: activeTab === 'wireframe1' ? '3px solid #C8102E' : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'wireframe1' ? 'bold' : 'normal',
            color: activeTab === 'wireframe1' ? '#C8102E' : '#6b7280',
            transition: 'all 0.2s'
          }}
        >
          Wireframe 1
        </button>
        <button
          onClick={() => setActiveTab('wireframe2')}
          style={{
            padding: '15px 30px',
            background: activeTab === 'wireframe2' ? 'white' : '#f3f4f6',
            border: 'none',
            borderBottom: activeTab === 'wireframe2' ? '3px solid #C8102E' : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'wireframe2' ? 'bold' : 'normal',
            color: activeTab === 'wireframe2' ? '#C8102E' : '#6b7280',
            transition: 'all 0.2s'
          }}
        >
          Wireframe 2
        </button>
        <button
          onClick={() => setActiveTab('wireframe3')}
          style={{
            padding: '15px 30px',
            background: activeTab === 'wireframe3' ? 'white' : '#f3f4f6',
            border: 'none',
            borderBottom: activeTab === 'wireframe3' ? '3px solid #C8102E' : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'wireframe3' ? 'bold' : 'normal',
            color: activeTab === 'wireframe3' ? '#C8102E' : '#6b7280',
            transition: 'all 0.2s'
          }}
        >
          Wireframe 3
        </button>
      </div>

      {/* Content Area */}
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        minHeight: '400px'
      }}>
        {activeTab === 'about' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#1f2937' }}>About Jobbahub</h2>
            <p style={{ lineHeight: '1.8', marginBottom: '15px' }}>
              Jobbahub is een platform voor studenten om keuzemodules te vinden en te kiezen die passen bij hun interesses en studie.
            </p>
            <p style={{ lineHeight: '1.8' }}>
              Met Jobbahub kun je eenvoudig door verschillende modules bladeren, favorieten opslaan, en een vragenlijst invullen om gepersonaliseerde aanbevelingen te krijgen.
            </p>
          </div>
        )}

        {activeTab === 'casus' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#1f2937' }}>Casus</h2>
            <p style={{ lineHeight: '1.8' }}>
              Hier komt de casus beschrijving voor het project.
            </p>
          </div>
        )}

        {activeTab === 'userstories' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#1f2937' }}>User Stories</h2>
            <p style={{ lineHeight: '1.8' }}>
              Hier komen de user stories voor het project.
            </p>
          </div>
        )}

        {activeTab === 'wireframe1' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#1f2937' }}>Wireframe 1</h2>
            <p style={{ lineHeight: '1.8' }}>
              Hier komt Wireframe 1.
            </p>
          </div>
        )}

        {activeTab === 'wireframe2' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#1f2937' }}>Wireframe 2</h2>
            <p style={{ lineHeight: '1.8' }}>
              Hier komt Wireframe 2.
            </p>
          </div>
        )}

        {activeTab === 'wireframe3' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#1f2937' }}>Wireframe 3</h2>
            <p style={{ lineHeight: '1.8' }}>
              Hier komt Wireframe 3.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default About;