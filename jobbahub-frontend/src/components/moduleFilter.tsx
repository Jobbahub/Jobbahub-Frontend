import React, { useState, useRef, useMemo, useEffect } from "react";
import { IChoiceModule } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface ModuleFilterProps {
  modules: IChoiceModule[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

const ModuleFilter: React.FC<ModuleFilterProps> = ({
  modules,
  selectedTags,
  onTagToggle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const filterData = useMemo(() => {
    const categories = new Set<string>();
    const locations = new Set<string>();
    const credits = new Set<string>();
    const languages = new Set<string>();

    modules.forEach((mod) => {
      if (mod.main_filter) {
        mod.main_filter.split(",").forEach((c) => {
          const cleanCategory = c.replace(/[\[\]']/g, "").trim();
          if (cleanCategory) categories.add(cleanCategory);
        });
      }

      if (mod.location) {
        locations.add(mod.location.trim());
      }

      if (mod.studycredit) {
        credits.add(`${mod.studycredit} EC`);
      }

      if (mod.taal) {
        languages.add(mod.taal.trim());
      }
    });

    return {
      categories: Array.from(categories).sort(),
      locations: Array.from(locations).sort(),
      credits: Array.from(credits).sort((a, b) => parseInt(a) - parseInt(b)),
      languages: Array.from(languages).sort(),
    };
  }, [modules]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderList = (items: string[], title: string) => (
    <div className="filter-section">
      <h4 className="filter-section-title">{t(title)}</h4>
      {items.map((item) => (
        <label key={item} className="filter-option-item">
          <input
            type="checkbox"
            checked={selectedTags.includes(item)}
            onChange={() => onTagToggle(item)}
            className="filter-checkbox"
          />
          <span>{t(item)}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="filter-dropdown-wrapper" ref={dropdownRef}>
      <button className="filter-trigger-btn" onClick={() => setIsOpen(!isOpen)}>
        <span>{t("Filters")}</span>
        {selectedTags.length > 0 && (
          <span className="filter-badge">{selectedTags.length}</span>
        )}
        <span className={`filter-arrow ${isOpen ? "is-open" : ""}`}>▼</span>
      </button>

      {isOpen && (
        <div className="filter-popup-menu">
          {renderList(filterData.categories, "Categorieën")}
          <hr className="filter-divider" />
          {renderList(filterData.locations, "Locaties")}
          <hr className="filter-divider" />
          {renderList(filterData.credits, "Studiepunten")}
          <hr className="filter-divider" />
          {renderList(filterData.languages, "Taal")}

          {selectedTags.length > 0 && (
            <button
              className="filter-clear-btn"
              onClick={() => selectedTags.forEach(onTagToggle)}
            >
              {t("Alle filters wissen")}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleFilter;
