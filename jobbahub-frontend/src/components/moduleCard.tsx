import React from 'react';
import { IChoiceModule } from '../types';

interface ModuleCardProps {
  module: IChoiceModule;
  onViewDetails?: (moduleId: string) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onViewDetails }) => {
  return (
    <div className="card">
      <img 
        src={module.image || 'https://placehold.co/300x200?text=Geen+Afbeelding'} 
        alt={module.name} 
        className="card-image"
      />
      
      <div className="card-body">
        <div className="card-meta">
          <div className="badge-container">
            {module.tags && module.tags.map(tag => (
              <span key={tag.id} className="badge">
                {tag.name}
              </span>
            ))}
          </div>
          <span className="credits">
            {module.studycredit} EC
          </span>
        </div>

        <h3 className="card-title">{module.name}</h3>
        
        <p className="card-text">
          {module.shortdescription || module.description}
        </p>

        <button 
          className="btn btn-secondary w-full" 
          onClick={() => onViewDetails && onViewDetails(module._id)}
        >
          Bekijk Details
        </button>
      </div>
    </div>
  );
};

export default ModuleCard;