import React from "react";
import { useLanguage } from '../context/LanguageContext';

interface ModuleSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const ModuleSearch: React.FC<ModuleSearchProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  const { t } = useLanguage();
  return (
    <div className="search-wrapper mb-6">
      <input
        type="text"
        className="search-input"
        placeholder={t("Zoek een module...")}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default ModuleSearch;