import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AIRecommendation, VragenlijstData } from '../services/apiService';
import { IChoiceModule } from '../types';
import { TOPICS } from './vragenlijstFormulier';

interface VragenlijstResultatenProps {
  aiRecs: AIRecommendation[];
  dbModules: IChoiceModule[];
  userAnswers: VragenlijstData | null;
  onRetry: () => void;
}

const VragenlijstResultaten: React.FC<VragenlijstResultatenProps> = ({ aiRecs, dbModules, userAnswers, onRetry }) => {
  const navigate = useNavigate();

  const getImage = (name: string) => {
    const found = dbModules.find(m => m.name.toLowerCase().includes(name.toLowerCase()));
    return `https://picsum.photos/seed/${name.length}/300/200`;
  };

  const getRealId = (name: string) => {
    const found = dbModules.find(m => m.name.toLowerCase().includes(name.toLowerCase()));
    return found?._id;
  };

  const getScoreLabel = (score: number) => {
    switch(score) {
      case 0: return "Nee";
      case 1: return "Neutraal";
      case 2: return "Ja";
      default: return "-";
    }
  };

  const getScoreClass = (score: number) => {
    switch(score) {
      case 0: return "score-negative";
      case 1: return "score-neutral";
      case 2: return "score-positive";
      default: return "";
    }
  };

  // Categorie indeling op basis van ID's
  const categories = {
    vakgebieden: ['q_tech', 'q_health', 'q_law', 'q_edu', 'q_econ', 'q_comm', 'q_eng', 'q_sport', 'q_creative', 'q_biz'],
    waarden: ['q_social', 'q_sustain', 'q_intl'],
    doelen: ['q_research', 'q_personal', 'q_broadening']
  };

  // Helper om een lijstje te renderen
  const renderTopicList = (ids: string[]) => {
    if (!userAnswers) return null;
    
    // Filter de topics die in de lijst van IDs staan
    const filteredTopics = TOPICS.filter(t => ids.includes(t.id));

    return (
      <ul className="detail-list" style={{border: 'none'}}>
        {filteredTopics.map((topic) => {
          const score = userAnswers.knoppen_input[topic.id]?.score;
          return (
            <li key={topic.id} style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>
              <span style={{fontSize: '0.9rem'}}>{topic.label}</span>
              <span className={getScoreClass(score)} style={{fontSize: '0.9rem'}}>
                {getScoreLabel(score)}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="container">
      <h1 className="page-header center-text">Jouw Resultaten</h1>
      <p className="page-intro center-text">
        Op basis van jouw antwoorden hebben we deze modules gevonden.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <button className="btn btn-secondary" onClick={onRetry}>
          Opnieuw invullen
        </button>
      </div>

      {aiRecs.length === 0 ? (
        <div className="form-container" style={{ textAlign: 'center', padding: '40px', marginBottom: '40px' }}>
          <h3 className="form-title">Geen matches gevonden</h3>
          <p>Helaas heeft de AI geen modules kunnen vinden die goed aansluiten bij jouw huidige antwoorden.</p>
        </div>
      ) : (
        <div className="grid-container" style={{ marginBottom: '60px' }}>
          {aiRecs.map((rec, index) => {
            const realId = getRealId(rec.name);

            return (
              <div key={index} className="card" style={{ flexDirection: 'column' }}>
                <div className="result-card-image-wrapper">
                  <img
                    src={getImage(rec.name)}
                    alt={rec.name}
                    className="result-card-image"
                  />
                  <span className="match-badge">
                    {rec.match_percentage}% Match
                  </span>
                </div>

                <div className="card-body">
                  <h3 className="card-title">{rec.name}</h3>

                  <div className="why-box">
                    <strong>Waarom:</strong> {rec.waarom}
                  </div>

                  <span className="credits credits-block">
                    {rec.studycredit} EC
                  </span>

                  {realId ? (
                    <button
                      className="btn btn-secondary w-full"
                      onClick={() => navigate(`/modules/${realId}`)}
                    >
                      Bekijk Details
                    </button>
                  ) : (
                    <button className="btn btn-disabled w-full" disabled>
                      Details niet beschikbaar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- NIEUWE 3-KOLOMS LAYOUT --- */}
      {userAnswers && (
        <div style={{marginTop: '60px', marginBottom: '60px'}}>
          <h2 className="form-title center-text" style={{ fontSize: '1.8rem', marginBottom: '30px' }}>
            Jouw Profiel
          </h2>
          
          <div className="results-summary-grid">
            
            {/* Kolom 1: Algemeen & Voorkeuren */}
            <div className="result-column">
              <h4>Algemeen & Voorkeuren</h4>
              <ul className="detail-list" style={{border: 'none'}}>
                <li style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>
                  <strong>Taal</strong>
                  <span>{userAnswers.keuze_taal || "Geen voorkeur"}</span>
                </li>
                <li style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>
                  <strong>Locatie</strong>
                  <span>{userAnswers.keuze_locatie || "Geen voorkeur"}</span>
                </li>
                <li style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>
                  <strong>Studiepunten</strong>
                  <span>{userAnswers.keuze_punten ? `${userAnswers.keuze_punten} EC` : "Geen voorkeur"}</span>
                </li>
              </ul>

              {userAnswers.open_antwoord && (
                <div style={{ marginTop: '20px' }}>
                  <strong style={{ display: 'block', marginBottom: '5px', color: 'var(--secondary-color)' }}>Jouw Toelichting:</strong>
                  <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#555' }}>
                    "{userAnswers.open_antwoord}"
                  </div>
                </div>
              )}
            </div>

            {/* Kolom 2: Vakgebieden (Interesses) */}
            <div className="result-column">
              <h4>Interesses (Vakgebieden)</h4>
              {renderTopicList(categories.vakgebieden)}
            </div>

            {/* Kolom 3: Waarden & Doelen */}
            <div className="result-column">
              <h4>Waarden & Doelen</h4>
              
              <h5 style={{fontSize: '0.95rem', color: '#666', marginTop: '10px', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px'}}>Waarden</h5>
              {renderTopicList(categories.waarden)}

              <h5 style={{fontSize: '0.95rem', color: '#666', marginTop: '20px', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px'}}>Doelen</h5>
              {renderTopicList(categories.doelen)}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default VragenlijstResultaten;