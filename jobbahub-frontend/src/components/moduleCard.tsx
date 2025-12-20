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

  // Gebruik module.image als die bestaat, anders de picsum fallback o.b.v. ID
  const imageUrl = `https://picsum.photos/id/${module.id % 1084}/600/400`;

  return (
    <div className="card clickable-card" onClick={() => onClick(String(module.id))}>
      
      <div className="result-card-image-wrapper">
        {/* Favorieten knop RECHTSBOVEN */}
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

        {/* AI Match Badges LINKSBOVEN */}
        {matchPercentage !== undefined && matchPercentage !== null && (
          <span className="match-badge">
            {matchPercentage}% Match
          </span>
        )}
        
        {isCluster && (
           <span className="match-badge" style={{backgroundColor: '#eab308'}}>
             Populair in Cluster
           </span>
        )}
      </div>
      
      <div className="card-body">
        <h3 className="card-title">{module.name}</h3>
        
        {/* TAGS SECTIE */}
        <div className="card-tags-container">
          {/* 1. Main Filter */}
          {module.main_filter && (
            <span className="tag-main">{module.main_filter}</span>
          )}

          {/* 2. Toggle Knop (alleen als er tags zijn) */}
          {tags.length > 0 && (
            <button 
              className={`tag-toggle-btn ${tagsExpanded ? 'expanded' : ''}`} 
              onClick={handleToggleTags}
              title={tagsExpanded ? "Verberg tags" : "Toon alle tags"}
            >
              {'>'} 
            </button>
          )}

          {/* 3. De overige tags */}
          {tagsExpanded && tags.map((tag, index) => (
            <span key={index} className="tag-secondary">{tag}</span>
          ))}
        </div>

        {/* AI uitleg (indien aanwezig) */}
        {explanation && (
          <div 
            className="why-box" 
            style={isCluster ? { borderLeftColor: '#eab308', backgroundColor: '#fefce8', color: '#854d0e', marginBottom: '15px' } : { marginBottom: '15px' }}
          >
            <strong>Waarom:</strong> {explanation}
          </div>
        )}

        {/* KORTE BESCHRIJVING (Teruggeplaatst) */}
        <p className="card-text" style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px'}}>
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