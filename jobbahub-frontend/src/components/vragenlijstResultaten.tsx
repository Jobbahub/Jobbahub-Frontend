import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AIRecommendation } from '../services/apiService';
import { IChoiceModule } from '../types';

interface VragenlijstResultatenProps {
  aiRecs: AIRecommendation[];
  dbModules: IChoiceModule[];
  onRetry: () => void;
}

const VragenlijstResultaten: React.FC<VragenlijstResultatenProps> = ({ aiRecs, dbModules, onRetry }) => {
  const navigate = useNavigate();

  const getImage = (name: string) => {
    const found = dbModules.find(m => m.name.toLowerCase().includes(name.toLowerCase()));
    return `https://picsum.photos/seed/${name.length}/300/200`;
  };

  const getRealId = (name: string) => {
    const found = dbModules.find(m => m.name.toLowerCase().includes(name.toLowerCase()));
    return found?._id;
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
        <div className="form-container" style={{ textAlign: 'center', padding: '40px' }}>
          <h3 className="form-title">Geen matches gevonden</h3>
          <p>Helaas heeft de AI geen modules kunnen vinden die goed aansluiten bij jouw huidige antwoorden. Probeer je zoekopdracht of filters aan te passen.</p>
        </div>
      ) : (
        <div className="grid-container">
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
    </div>
  );
};

export default VragenlijstResultaten;