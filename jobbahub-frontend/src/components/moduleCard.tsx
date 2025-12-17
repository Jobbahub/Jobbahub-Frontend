import React from 'react';
import { IChoiceModule } from '../types';

interface ModuleCardProps {
  module: IChoiceModule;
  onViewDetails?: (moduleId: string) => void;
}

// Hulpfunctie om een consistente Picsum URL te genereren op basis van het ID
// We gebruiken 300x200 voor de cards
const getCardImageUrl = (id: number) => {
  // Gebruik modulo (%) 1084 (aantal picsum images) om te zorgen dat we altijd een geldig ID hebben.
  const picsumId = id % 1084; 
  return `https://picsum.photos/id/${picsumId}/300/200`;
};

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onViewDetails }) => {
  // Genereer de afbeelding URL
  const imageUrl = getCardImageUrl(module.id);

  return (
    <div className="card">
      <img 
        src={imageUrl} 
        alt={module.name} 
        className="card-image"
        // 'lazy' loading zorgt dat afbeeldingen pas laden als ze bijna in beeld komen
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

// (Kopie van de parseTags functie die je al eerder had, voor de zekerheid)
const parseTags = (tagString?: string): string[] => {
  if (!tagString) return [];
  try {
    return tagString.replace(/[\[\]']/g, '').split(',').map(t => t.trim()).filter(t => t !== "");
  } catch {
    return [];
  }
};

export default ModuleCard;