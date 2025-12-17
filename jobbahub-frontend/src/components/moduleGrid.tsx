import React from "react"; // useMemo en useState zijn niet meer nodig
import { IChoiceModule } from "../types";
import ModuleCard from "./moduleCard";
// import ModuleSearch from "./moduleSearch"; // <-- DEZE IMPORT IS VERWIJDERD

interface ModuleGridProps {
  /** De modules die al gefilterd en gepagineerd zijn door de oudercomponent. */
  modules: IChoiceModule[];
  loading?: boolean;
  error?: string | null;
  onViewDetails?: (moduleId: string) => void;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  isAuthenticated?: boolean;
  
  // Opmerking: searchTerm is hier niet meer nodig als prop
}

const ModuleGrid: React.FC<ModuleGridProps> = ({
  modules, // Deze array bevat nu alleen de modules voor de huidige pagina en zoekopdracht
  loading,
  error,
  onViewDetails,
  favorites = [],
  onToggleFavorite,
  isAuthenticated = false
}) => {
  // Alle zoekstate (searchTerm) en filterlogica (useMemo) zijn VERWIJDERD.
  // De component rendert nu direct wat het meekrijgt via de 'modules' prop.

  if (loading) return <div className="p-6 text-center text-gray-500">Modules laden...</div>;
  if (error) return <div className="container form-error">{error}</div>;

  // Controleer op basis van de meegegeven 'modules' prop.
  if (!modules || modules.length === 0) return <div className="text-center text-muted mt-8">Geen modules gevonden.</div>;

  return (
    <div className="container">
      {/* <ModuleSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} /> <-- DIT IS VERWIJDERD */}

      <div className="grid-container">
        {/* We gebruiken de 'modules' prop direct, er is geen filteredModules meer */}
        {modules.map((module) => (
          <ModuleCard
            key={module._id}
            module={module}
            onViewDetails={onViewDetails}
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