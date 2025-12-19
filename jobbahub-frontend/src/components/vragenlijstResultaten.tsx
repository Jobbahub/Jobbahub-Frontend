import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AIRecommendation, ClusterRecommendation, VragenlijstData } from '../services/apiService';
import { IChoiceModule } from '../types';
import { TOPICS } from './vragenlijstFormulier';

interface VragenlijstResultatenProps {
  aiRecs: AIRecommendation[];
  clusterRecs: ClusterRecommendation[];
  dbModules: IChoiceModule[];
  userAnswers: VragenlijstData | null;
  onRetry: () => void;
}

const VragenlijstResultaten: React.FC<VragenlijstResultatenProps> = ({ aiRecs, clusterRecs, dbModules, userAnswers, onRetry }) => {
  const navigate = useNavigate();

  // Helper om plaatje te zoeken (of placeholder)
  const getImage = (name: string) => {
    const found = dbModules.find(m => m.name.toLowerCase().includes(name.toLowerCase()));
    return `https://picsum.photos/seed/${name.length}/300/200`;
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

  // Categorie indeling
  const categories = {
    vakgebieden: ['q_tech', 'q_health', 'q_law', 'q_edu', 'q_econ', 'q_comm', 'q_eng', 'q_sport', 'q_creative', 'q_biz'],
    waarden: ['q_social', 'q_sustain', 'q_intl'],
    doelen: ['q_research', 'q_personal', 'q_broadening']
  };

  const renderTopicList = (ids: string[]) => {
    if (!userAnswers) return null;
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

  // Render functie voor een kaart (Verbeterd: zoekt zelf studiepunten op)
  const renderCard = (name: string, reason: string, percentage: number | null, isCluster: boolean, studyCreditFromAI?: number) => {
    // 1. Zoek de echte module in de database lijst op basis van naam
    const foundModule = dbModules.find(m => m.name.toLowerCase().includes(name.toLowerCase()));
    
    // 2. Bepaal ID en Studiepunten (Gebruik AI data als aanwezig, anders fallback naar DB module)
    const realId = foundModule?.id;
    const finalCredits = studyCreditFromAI || foundModule?.studycredit;

    return (
      <div className="card" style={{ flexDirection: 'column' }}>
        <div className="result-card-image-wrapper">
          <img
            src={getImage(name)}
            alt={name}
            className="result-card-image"
          />
          {percentage !== null && (
            <span className="match-badge">
              {percentage}% Match
            </span>
          )}
          {isCluster && (
             <span className="match-badge" style={{backgroundColor: '#eab308'}}>
               Populair in Cluster
             </span>
          )}
        </div>

        <div className="card-body">
          <h3 className="card-title">{name}</h3>

          <div className="why-box" style={isCluster ? { borderLeftColor: '#eab308', backgroundColor: '#fefce8', color: '#854d0e' } : {}}>
            <strong>Waarom:</strong> {reason}
          </div>

          <span className="credits credits-block">
            {finalCredits ? `${finalCredits} EC` : 'Punten n.t.b.'}
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
  };

  return (
    <div className="container">
      <h1 className="page-header center-text">Jouw Resultaten</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <button className="btn btn-secondary" onClick={onRetry}>
          Opnieuw invullen
        </button>
      </div>

      {aiRecs.length === 0 ? (
        <div className="form-container" style={{ textAlign: 'center', padding: '40px', marginBottom: '40px' }}>
          <h3 className="form-title">Geen matches gevonden</h3>
          <p>Helaas heeft de AI geen modules kunnen vinden.</p>
        </div>
      ) : (
        <>
          {/* SECTIE 1: Directe Matches */}
          <p className="page-intro center-text">
            Op basis van jouw antwoorden passen deze modules het beste bij jou.
          </p>
          <div className="grid-container" style={{ marginBottom: '60px' }}>
            {aiRecs.map((rec, index) => (
              <div key={`rec-${index}`}>
                {renderCard(rec.name, rec.waarom, rec.match_percentage, false, rec.studycredit)}
              </div>
            ))}
          </div>

          {/* SECTIE 2: Cluster Suggesties */}
          {clusterRecs.length > 0 && (
            <div style={{ marginTop: '60px', marginBottom: '60px', borderTop: '1px solid #e5e7eb', paddingTop: '40px' }}>
              <h2 className="form-title center-text" style={{fontSize: '1.8rem'}}>Ook interessant voor jou</h2>
              <div style={{ maxWidth: '800px', margin: '0 auto 30px auto', textAlign: 'center', color: '#555', lineHeight: '1.6' }}>
                <p>
                  Naast je directe matches hebben we ook gekeken naar je <strong>nummer 1 match</strong>. 
                  De onderstaande modules vallen binnen hetzelfde vakgebied (cluster) als die match. 
                  Binnen dit cluster hebben we de <strong>populairste modules</strong> geselecteerd die ook aansluiten bij jouw trefwoorden.
                </p>
              </div>

              <div className="grid-container">
                {clusterRecs.map((rec, index) => (
                  <div key={`cluster-${index}`}>
                    {/* Voor clusters geven we 'null' mee als percentage en studiepunten (de functie zoekt ze nu zelf op) */}
                    {renderCard(rec.name, rec.waarom, null, true)} 
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* SECTIE 3: Samenvatting van antwoorden (Profiel) */}
      {userAnswers && (
        <div style={{marginTop: '40px', marginBottom: '60px', borderTop: '1px solid #e5e7eb', paddingTop: '40px'}}>
          <h2 className="form-title center-text" style={{ fontSize: '1.8rem', marginBottom: '30px' }}>
            Jouw Profiel
          </h2>
          
          <div className="results-summary-grid">
            {/* Kolom 1 */}
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

            {/* Kolom 2 */}
            <div className="result-column">
              <h4>Interesses (Vakgebieden)</h4>
              {renderTopicList(categories.vakgebieden)}
            </div>

            {/* Kolom 3 */}
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