import React from "react"; 
import { IChoiceModule } from "../types";
import ModuleCard from "./moduleCard";

interface ModuleGridProps {
  modules: IChoiceModule[];
  loading?: boolean;
  error?: string | null;
  onViewDetails?: (moduleId: string) => void;
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

  if (loading) return <div className="loading-simple">Modules laden...</div>;
  if (error) return <div className="container form-error">{error}</div>;

  if (!modules || modules.length === 0) return <div className="loading-simple btn-margin-top">Geen modules gevonden.</div>;

  return (
    <div className="container">
      <div className="grid-container">
        {modules.map((module) => (
          <ModuleCard
            key={module._id}
            module={module}
            onClick={onViewDetails ? () => onViewDetails(String(module.id)) : () => {}}
            isFavorite={favorites.includes(module._id)}
            onToggleFavorite={onToggleFavorite}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </div>
  );
};

export default ModuleGrid;