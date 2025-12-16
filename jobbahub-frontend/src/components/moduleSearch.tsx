import React, { useMemo, useState } from "react";
import { IChoiceModule } from "../types";

interface ModuleSearchProps {
  modules: IChoiceModule[];
  onViewDetails?: (moduleId: string) => void;
}

const ModuleSearch: React.FC<ModuleSearchProps> = ({
  modules,
  onViewDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);
  const [isFocused, setIsFocused] = useState(false);

  const filteredModules = useMemo(() => {
    return modules
      .filter((module) =>
        module.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, visibleCount);
  }, [searchTerm, modules, visibleCount]);

  const displayedModules = filteredModules.slice(0, visibleCount);

  const hasMore = visibleCount < filteredModules.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  return (
    <div className="search-wrapper">
      <input
        type="text"
        className="search-input"
        placeholder="Zoek een module..."
        value={searchTerm}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setVisibleCount(5);
        }}
      />

      {isFocused && searchTerm !== "" && (
        <div className="card search-results-dropdown">
          {displayedModules.length > 0 ? (
            <>
              {displayedModules.map((module) => (
                <div
                  key={module._id}
                  className="search-result-item"
                  onMouseDown={(e) => {
                    e.preventDefault(); //Momenteel voor focus, haal weg bij redirect
                    onViewDetails?.(module._id);
                  }}
                >
                  <img
                    src={module.image || "https://placehold.co/50x50?text=?"}
                    alt=""
                    className="search-thumb"
                  />
                  <h3 className="search-title">{module.name}</h3>
                  <span className="text-muted small ms-2">&rsaquo;</span>
                </div>
              ))}

              {hasMore && (
                <button
                  className="btn-load-more"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleLoadMore();
                  }}
                >
                  Laad meer resultaten...
                </button>
              )}
            </>
          ) : (
            <div className="p-3 text-center text-muted small">
              Geen modules gevonden.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleSearch;
