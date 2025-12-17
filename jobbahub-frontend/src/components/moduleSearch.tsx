import React from "react";

interface ModuleSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const ModuleSearch: React.FC<ModuleSearchProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="search-wrapper mb-6">
      <input
        type="text"
        className="search-input"
        placeholder="Zoek een module..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default ModuleSearch;