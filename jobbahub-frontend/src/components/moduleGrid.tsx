import React, { useMemo, useState } from "react";
import { IChoiceModule } from "../types";
import ModuleCard from "./moduleCard";
import ModuleSearch from "./moduleSearch"; // Zorg dat deze import klopt

interface ModuleGridProps {
  modules: IChoiceModule[];
  loading?: boolean;
  error?: string | null;
  onViewDetails?: (moduleId: string) => void;
}

const ModuleGrid: React.FC<ModuleGridProps> = ({
  modules,
  loading,
  error,
  onViewDetails,
}) => {
  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Filter logica
  const filteredModules = useMemo(() => {
    if (!searchTerm) return modules;

    return modules.filter((module) =>
      // Zoekt nu case-insensitive (hoofdletterongevoelig) in de naam
      module.name.toLowerCase().includes(searchTerm.toLowerCase())
      // Optioneel: Je kunt hier ook zoeken in tags of beschrijving:
      // || module.shortdescription.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, modules]);

  // 1. Laad status
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Modules laden...</div>
    );
  }

  // 2. Fout status
  if (error) {
    return (
      <div className="container form-error">
        {error}
      </div>
    );
  }

  // 3. Lege status (als er überhaupt geen modules zijn, niet door zoekopdracht)
  if (!modules || modules.length === 0) {
    return (
      <div className="text-center text-muted mt-8">
        Geen modules beschikbaar.
      </div>
    );
  }

  // 4. Het Grid met Zoekbalk
  return (
    <div className="container">
      {/* De nieuwe zoekbalk component */}
      <ModuleSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className="grid-container">
        {filteredModules.length > 0 ? (
          filteredModules.map((module) => (
            <ModuleCard
              key={module._id}
              module={module}
              onViewDetails={onViewDetails}
            />
          ))
        ) : (
          /* Melding als zoekopdracht niets oplevert */
          <div className="text-center w-full" style={{ gridColumn: '1 / -1', padding: '40px', color: 'var(--text-muted)' }}>
            <p>Geen modules gevonden voor "<strong>{searchTerm}</strong>".</p>
            <button 
                onClick={() => setSearchTerm('')} 
                className="btn btn-secondary"
                style={{ marginTop: '10px' }}
            >
                Wis zoekopdracht
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleGrid;