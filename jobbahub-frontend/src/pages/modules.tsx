// ElectiveModules.tsx (Versie met Zoekfunctionaliteit en Paginering)

import React, { useEffect, useState, useMemo } from "react";
import { IChoiceCustomModule, IChoiceModule } from "../types";
import { apiService } from "../services/apiService";
import ModuleGrid from "../components/moduleGrid";
import Pagination from "../components/modulePagination";
import ModuleSearch from "../components/moduleSearch"; // <-- Importeer de Zoekcomponent
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import ModuleFilter from "../components/moduleFilter";

const ITEMS_PER_PAGE = 8;

const ElectiveModules: React.FC = () => {
  const [allModules, setAllModules] = useState<IChoiceCustomModule[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Nieuwe State voor Zoekterm
  const [searchTerm, setSearchTerm] = useState("");
  // State voor Paginering
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Data Fetchen (onveranderd)
  useEffect(() => {
    // ... fetchData logica ...
    const fetchData = async () => {
      try {
        const modulesData = await apiService.getModules();
        if (Array.isArray(modulesData)) {
          setAllModules(modulesData);
        } else {
          setAllModules([]);
          setError("Ongeldig dataformaat ontvangen.");
        }
        if (isAuthenticated) {
          const favData = await apiService.getFavorites();
          setFavorites(favData);
        }
      } catch (err) {
        setError("Kon de modules niet laden. Controleer de API.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const filteredModules = useMemo(() => {
    return allModules.filter((module) => {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const matchesSearch =
        module.name.toLowerCase().includes(lowerCaseSearch) ||
        (module.description &&
          module.description.toLowerCase().includes(lowerCaseSearch));

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => module.tags_list?.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [allModules, searchTerm, selectedTags]);

  const { currentModules, totalPages } = useMemo(() => {
    const totalItems = filteredModules.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

    const currentModules = filteredModules.slice(
      indexOfFirstItem,
      indexOfLastItem
    );

    if (currentModules.length === 0 && totalPages > 0) {
      setCurrentPage(totalPages);
      return {
        currentModules: filteredModules.slice(
          totalPages * ITEMS_PER_PAGE - ITEMS_PER_PAGE,
          totalPages * ITEMS_PER_PAGE
        ),
        totalPages,
      };
    }

    return { currentModules, totalPages };
  }, [filteredModules, currentPage]);

  // 4. HANDLER: Zorgt ervoor dat de pagina naar 1 springt bij het zoeken
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Cruciaal: Reset naar de eerste pagina bij elke zoekopdracht
  };

  // Handler functie voor de Paginering (onveranderd)
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ... Bestaande handlers (handleDetailsClick, handleToggleFavorite) ...
  const handleDetailsClick = (id: string) => {
    navigate(`/modules/${id}`);
  };

  const handleToggleFavorite = async (moduleId: string) => {
    // ... bestaande favorieten logica ...
    if (!isAuthenticated) return;

    const isFav = favorites.includes(moduleId);
    try {
      if (isFav) {
        await apiService.removeFavorite(moduleId);
        setFavorites((prev) => prev.filter((id) => id !== moduleId));
      } else {
        await apiService.addFavorite(moduleId);
        setFavorites((prev) => [...prev, moduleId]);
      }
    } catch (error) {
      console.error("Fout bij updaten favoriet:", error);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="container">
        <h1 className="page-header">Beschikbare Keuzemodules</h1>
        <p className="page-intro">
          Kies uit een breed aanbod van modules om je skills te verbeteren.
        </p>

        {/* Voeg de zoekbalk toe */}
        <div className="search-filter-controls">
          <ModuleSearch
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />

          <ModuleFilter
            modules={allModules}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
          />
        </div>
      </div>

      <ModuleGrid
        modules={currentModules}
        loading={loading}
        error={error}
        onViewDetails={handleDetailsClick}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        isAuthenticated={isAuthenticated}
      />

      {/* ------------------------------------- */}
      {/* Paginatie renderen                   */}
      {/* ------------------------------------- */}
      {!loading && !error && totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}

      {/* Geen resultaten melding */}
      {/* {!loading && !error && (
        <div className="text-center p-6 text-gray-500">
          Er zijn geen modules gevonden die overeenkomen met "{searchTerm}".
        </div>
      )} */}
    </div>
  );
};

export default ElectiveModules;
