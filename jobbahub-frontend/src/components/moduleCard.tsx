import React from 'react';
import { IChoiceModule } from '../types';

interface ModuleCardProps {
  module: IChoiceModule;
  onViewDetails?: (moduleId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  isAuthenticated?: boolean;
}

const getCardImageUrl = (id: number) => {
  const picsumId = id % 1084; 
  return `https://picsum.photos/id/${picsumId}/300/200`;
};

const parseTags = (tagString?: string): string[] => {
  if (!tagString) return [];
  try {
    return tagString.replace(/[\[\]']/g, '').split(',').map(t => t.trim()).filter(t => t !== "");
  } catch {
    return [];
  }
};

const ModuleCard: React.FC<ModuleCardProps> = ({ 
  module, 
  onViewDetails, 
  isFavorite = false, 
  onToggleFavorite, 
  isAuthenticated = false 
}) => {
  const imageUrl = getCardImageUrl(module.id);

  return (
    <div className="card">
      {/* Favoriet Knop */}
      {isAuthenticated && (
        <button 
          className={`btn-favorite-card ${isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation(); 
            onToggleFavorite && onToggleFavorite(module._id);
          }}
          title={isFavorite ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      )}

      <img 
        src={imageUrl} 
        alt={module.name} 
        className="card-image"
        loading="lazy" 
      />
      
      <div className="card-body">
        <div className="card-meta">
          <div className="badge-container">
            {module.module_tags && parseTags(module.module_tags).slice(0, 3).map((tag, index) => (
              <span key={index} className="badge">
                {tag}
              </span>
            ))}
          </div>
          <span className="credits">
            {module.studycredit} EC
          </span>
        </div>

        <h3 className="card-title">{module.name}</h3>
        
        <p className="card-text">
          {module.shortdescription}
        </p>

        <button 
          className="btn btn-secondary w-full" 
          onClick={() => onViewDetails && onViewDetails(module.id.toString())}
        >
          Bekijk Details
        </button>
      </div>
    </div>
  );
};

export default ModuleCard;