import React, { useState, useRef, useEffect, useMemo } from "react";
import { IChoiceModule } from "../types";

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

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();

    modules.forEach((mod) => {
      // AANGEPAST: Gebruik main_filter i.p.v. tags_list
      if (mod.main_filter) {
        try {
          // Probeer te parsen als JSON array string (net als oude tags_list)
          // Vervang single quotes met double quotes voor valid JSON
          const cleaned = mod.main_filter.replace(/'/g, '"');
          if (cleaned.trim().startsWith('[') && cleaned.trim().endsWith(']')) {
            const parsed: string[] = JSON.parse(cleaned);
            parsed.forEach((tag) => {
              if (tag) tagSet.add(tag.trim());
            });
          } else {
            // Fallback: Als het geen JSON array is, behandel als simpele string (evt. comma-separated)
            mod.main_filter.split(',').forEach(t => tagSet.add(t.trim()));
          }
        } catch (error) {
          // Als parsen mislukt, voeg gewoon de ruwe waarde toe
          console.warn("Kon main_filter niet als JSON parsen, gebruik ruwe waarde:", mod.main_filter);
          tagSet.add(mod.main_filter.trim());
        }
      }
    });

    return Array.from(tagSet).sort();
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

  if (availableTags.length === 0) return null;

  return (
    <div className="filter-dropdown-wrapper" ref={dropdownRef}>
      <button className="filter-trigger-btn" onClick={() => setIsOpen(!isOpen)}>
        <span>Filters</span>
        {selectedTags.length > 0 && (
          <span className="filter-badge">{selectedTags.length}</span>
        )}
        <span className={`filter-arrow ${isOpen ? "is-open" : ""}`}>▼</span>
      </button>

      {isOpen && (
        <div className="filter-popup-menu">
          <div className="filter-options-list">
            {availableTags.map((tag) => (
              <label key={tag} className="filter-option-item">
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => onTagToggle(tag)}
                />
                <span>{tag}</span>
              </label>
            ))}
          </div>

          {selectedTags.length > 0 && (
            <button
              className="filter-clear-btn"
              onClick={() => {
                selectedTags.forEach((t) => onTagToggle(t));
              }}
            >
              Alle filters wissen
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleFilter;
