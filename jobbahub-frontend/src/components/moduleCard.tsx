import React, { useState } from 'react';
import { IChoiceModule } from '../types';

interface ModuleCardProps {
  module: IChoiceModule;
  onClick: (id: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  isAuthenticated?: boolean;
  matchPercentage?: number | null;
  explanation?: string;
  isCluster?: boolean;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ 
  module, 
  onClick, 
  isFavorite, 
  onToggleFavorite, 
  isAuthenticated,
  matchPercentage,
  explanation,
  isCluster
}) => {
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(module._id);
    }
  };

  const handleToggleTags = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTagsExpanded(!tagsExpanded);
  };

  const parseTags = (tagString?: string): string[] => {
    if (!tagString) return [];
    try {
      return tagString.replace(/[\[\]']/g, '').split(',').map(t => t.trim()).filter(t => t !== "");
    } catch {
      return [];
    }
  };

  const tags = parseTags(module.tags_list);
  const imageUrl = `https://picsum.photos/id/${module.id % 1084}/600/400`;

  return (
    <div className="card clickable-card" onClick={() => onClick(String(module.id))}>
      
      <div className="result-card-image-wrapper">
        {isAuthenticated && onToggleFavorite && (
          <button 
            className={`btn-favorite-card ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            title={isFavorite ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
          >
            {isFavorite ? '♥' : '♡'}
          </button>
        )}

        <img 
          src={imageUrl}
          alt={module.name} 
          className="card-image" 
        />

        {matchPercentage !== undefined && matchPercentage !== null && (
          <span className="match-badge">
            {matchPercentage}% Match
          </span>
        )}
        
        {isCluster && (
           <span className="match-badge badge-cluster-color">
             Populair in Cluster
           </span>
        )}
      </div>
      
      <div className="card-body">
        <h3 className="card-title">{module.name}</h3>
        
        <div className="card-tags-container">
          {module.main_filter && (
            <span className="tag-main">{module.main_filter}</span>
          )}

          {tags.length > 0 && (
            <button 
              className={`tag-toggle-btn ${tagsExpanded ? 'expanded' : ''}`} 
              onClick={handleToggleTags}
              title={tagsExpanded ? "Verberg tags" : "Toon alle tags"}
            >
              {'>'} 
            </button>
          )}

          {tagsExpanded && tags.map((tag, index) => (
            <span key={index} className="tag-secondary">{tag}</span>
          ))}
        </div>

        {explanation && (
          <div className={`why-box ${isCluster ? 'why-box-cluster' : ''}`}>
            <strong>Waarom:</strong> {explanation}
          </div>
        )}

        <p className="card-text">
          {module.shortdescription || (module.description ? module.description.substring(0, 100) + '...' : '')}
        </p>
        
        <div className="card-meta">
          <span className="credits">{module.studycredit} EC</span>
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;