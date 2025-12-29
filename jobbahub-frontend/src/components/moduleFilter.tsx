import React, { useState, useRef, useEffect, useMemo } from "react";
import { IChoiceCustomModule } from "../types";

interface ModuleFilterProps {
  modules: IChoiceCustomModule[];
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
      if (mod.tags_list) {
        try {
          const parsed: string[] = JSON.parse(mod.tags_list.replace(/'/g, '"'));

          parsed.forEach((tag) => {
            if (tag) tagSet.add(tag.trim());
          });
        } catch (error) {
          console.error("Fout bij parsen tags_list:", mod.tags_list);
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
