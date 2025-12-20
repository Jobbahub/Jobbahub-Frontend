import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AIRecommendation, ClusterRecommendation, VragenlijstData } from '../services/apiService';
import { IChoiceModule } from '../types';
import { TOPICS } from './vragenlijstFormulier';
import ModuleCard from './moduleCard';

interface VragenlijstResultatenProps {
  aiRecs: AIRecommendation[];
  clusterRecs: ClusterRecommendation[];
  dbModules: IChoiceModule[];
  userAnswers: VragenlijstData | null;
  onRetry: () => void;
}

const VragenlijstResultaten: React.FC<VragenlijstResultatenProps> = ({ aiRecs, clusterRecs, dbModules, userAnswers, onRetry }) => {
  const navigate = useNavigate();

  const handleViewDetails = (id: string) => {
    navigate(`/modules/${id}`);
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

  const categories = {
    vakgebieden: ['q_tech', 'q_health', 'q_law', 'q_edu', 'q_econ', 'q_comm', 'q_eng', 'q_sport', 'q_creative', 'q_biz'],
    waarden: ['q_social', 'q_sustain', 'q_intl'],
    doelen: ['q_research', 'q_personal', 'q_broadening']
  };

  const renderTopicList = (ids: string[]) => {
    if (!userAnswers) return null;
    const filteredTopics = TOPICS.filter(t => ids.includes(t.id));
    return (
      <ul className="detail-list detail-list-clean">
        {filteredTopics.map((topic) => {
          const score = userAnswers.knoppen_input[topic.id]?.score;
          return (
            <li key={topic.id}>
              <span className="detail-list-label">{topic.label}</span>
              <span className={`detail-list-value ${getScoreClass(score)}`}>
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
      
      <div className="centered-btn-container">
        <button className="btn btn-secondary" onClick={onRetry}>
          Opnieuw invullen
        </button>
      </div>

      {aiRecs.length === 0 ? (
        <div className="form-container no-matches-box">
          <h3 className="form-title">Geen matches gevonden</h3>
          <p>Helaas heeft de AI geen modules kunnen vinden.</p>
        </div>
      ) : (
        <>
          <p className="page-intro center-text">
            Op basis van jouw antwoorden passen deze modules het beste bij jou.
          </p>
          <div className="grid-container grid-container-margin-bottom">
            {aiRecs.map((rec, index) => {
              const foundModule = dbModules.find(m => m.name.toLowerCase().includes(rec.name.toLowerCase()));
              if (!foundModule) return null;

              return (
                <ModuleCard 
                  key={`rec-${index}`}
                  module={foundModule}
                  onClick={handleViewDetails}
                  matchPercentage={rec.match_percentage}
                  explanation={rec.waarom}
                  isCluster={false}
                />
              );
            })}
          </div>

          {clusterRecs.length > 0 && (
            <div className="section-divider">
              <h2 className="form-title center-text section-title-large">Ook interessant voor jou</h2>
              <div className="section-intro-text">
                <p>
                  Naast je directe matches hebben we ook gekeken naar je <strong>nummer 1 match</strong>. 
                  De onderstaande modules vallen binnen hetzelfde vakgebied (cluster) als die match. 
                  Binnen dit cluster hebben we de <strong>populairste modules</strong> geselecteerd die ook aansluiten bij jouw trefwoorden.
                </p>
              </div>

              <div className="grid-container">
                {clusterRecs.map((rec, index) => {
                  const foundModule = dbModules.find(m => m.name.toLowerCase().includes(rec.name.toLowerCase()));
                  if (!foundModule) return null;

                  return (
                    <ModuleCard 
                      key={`cluster-${index}`}
                      module={foundModule}
                      onClick={handleViewDetails}
                      explanation={rec.waarom}
                      isCluster={true}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {userAnswers && (
        <div className="profile-section-container">
          <h2 className="form-title center-text section-title-large">
            Jouw Profiel
          </h2>
          
          <div className="results-summary-grid">
            <div className="result-column">
              <h4>Algemeen & Voorkeuren</h4>
              <ul className="detail-list detail-list-clean">
                <li>
                  <strong>Taal</strong>
                  <span>{userAnswers.keuze_taal || "Geen voorkeur"}</span>
                </li>
                <li>
                  <strong>Locatie</strong>
                  <span>{userAnswers.keuze_locatie || "Geen voorkeur"}</span>
                </li>
                <li>
                  <strong>Studiepunten</strong>
                  <span>{userAnswers.keuze_punten ? `${userAnswers.keuze_punten} EC` : "Geen voorkeur"}</span>
                </li>
              </ul>
              {userAnswers.open_antwoord && (
                <div className="profile-answer-block">
                  <span className="profile-answer-label">Jouw Toelichting:</span>
                  <div className="profile-answer-text">
                    "{userAnswers.open_antwoord}"
                  </div>
                </div>
              )}
            </div>

            <div className="result-column">
              <h4>Interesses (Vakgebieden)</h4>
              {renderTopicList(categories.vakgebieden)}
            </div>

            <div className="result-column">
              <h4>Waarden & Doelen</h4>
              <h5 className="topic-category-header">Waarden</h5>
              {renderTopicList(categories.waarden)}
              <h5 className="topic-category-header">Doelen</h5>
              {renderTopicList(categories.doelen)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VragenlijstResultaten;