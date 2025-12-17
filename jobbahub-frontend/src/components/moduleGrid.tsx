import React, { useMemo, useState } from "react";
import { IChoiceModule } from "../types";
import ModuleCard from "./moduleCard";
import ModuleSearch from "./moduleSearch";

interface ModuleGridProps {
  modules: IChoiceModule[];
  loading?: boolean;
  error?: string | null;
  onViewDetails?: (moduleId: string) => void;
  // Nieuwe props
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
  const [searchTerm, setSearchTerm] = useState("");

  const filteredModules = useMemo(() => {
    if (!searchTerm) return modules;
    return modules.filter((module) =>
      module.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, modules]);

  if (loading) return <div className="p-6 text-center text-gray-500">Modules laden...</div>;
  if (error) return <div className="container form-error">{error}</div>;
  if (!modules || modules.length === 0) return <div className="text-center text-muted mt-8">Geen modules beschikbaar.</div>;

  return (
    <div className="container">
      <ModuleSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className="grid-container">
        {filteredModules.length > 0 ? (
          filteredModules.map((module) => (
            <ModuleCard
              key={module._id}
              module={module}
              onViewDetails={onViewDetails}
              // Nieuwe props doorgeven aan Card
              isFavorite={favorites.includes(module._id)}
              onToggleFavorite={onToggleFavorite}
              isAuthenticated={isAuthenticated}
            />
          ))
        ) : (
          <div className="text-center w-full" style={{ gridColumn: '1 / -1', padding: '40px', color: 'var(--text-muted)' }}>
            <p>Geen modules gevonden voor "<strong>{searchTerm}</strong>".</p>
            <button onClick={() => setSearchTerm('')} className="btn btn-secondary" style={{ marginTop: '10px' }}>
                Wis zoekopdracht
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleGrid;