import React, { useMemo, useState } from "react";
import { IChoiceModule } from "../types";
import ModuleCard from "./moduleCard";
import ModuleSearch from "./moduleSearch";

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
  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const filteredModules = useMemo(() => {
    if (!searchTerm) return modules;

    return modules.filter((module) =>
      module.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="p-6 text-center text-red-500 bg-red-50 rounded-lg border border-red-100">
        {error}
      </div>
    );
  }

  // 3. Lege status
  if (!modules || modules.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        Geen modules gevonden.
      </div>
    );
  }

  // 4. Het Grid
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
            />
          ))
        ) : (
          <div className="text-center text-gray-500 mt-8 w-full">
            Geen modules gevonden voor "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleGrid;
