import React from 'react';
import ModuleCard from './moduleCard';
import { IChoiceModule } from '../types';

interface ModuleGridProps {
  modules: IChoiceModule[];
  loading?: boolean;
  error?: string | null;
  onViewDetails: (id: string) => void;
  favorites?: string[]; 
  onToggleFavorite?: (id: string) => void;
  isAuthenticated?: boolean;
}

const ModuleGrid: React.FC<ModuleGridProps> = ({ 
  modules, 
  loading, 
  error, 
  onViewDetails,
  favorites = [],
  onToggleFavorite,
  isAuthenticated = false 
}) => {
  if (loading) {
    return <div className="container" style={{padding: '20px', textAlign: 'center'}}>Laden...</div>;
  }

  if (error) {
    return <div className="container form-error">{error}</div>;
  }

  if (modules.length === 0) {
    return (
      <div className="container" style={{padding: '40px', textAlign: 'center'}}>
        <p>Geen modules gevonden.</p>
      </div>
    );
  }

  return (
    <div className="container grid-container">
      {modules.map((module) => (
        <ModuleCard 
          key={module._id} 
          module={module} 
          onClick={onViewDetails}
          isFavorite={favorites.includes(module._id)}
          onToggleFavorite={onToggleFavorite}
          isAuthenticated={isAuthenticated} // Deze prop doorgeven!
        />
      ))}
    </div>
  );
};

export default ModuleGrid;