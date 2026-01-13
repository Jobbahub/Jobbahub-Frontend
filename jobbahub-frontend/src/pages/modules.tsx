import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { IChoiceModule } from "../types";
import { apiService, ApiError } from "../services/apiService";
import ModuleGrid from "../components/moduleGrid";
import Pagination from "../components/modulePagination";
import ModuleSearch from "../components/moduleSearch";
import ModuleFilter from "../components/moduleFilter";
import { useAuth } from "../context/authContext";
import RecentlyViewed from "../components/RecentlyViewed";

const ITEMS_PER_PAGE = 9;

const ElectiveModules: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [allModules, setAllModules] = useState<IChoiceModule[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const searchTerm = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modulesData = await apiService.getModules();
        if (Array.isArray(modulesData)) {
          setAllModules(modulesData);
        } else {
          setAllModules([]);
          setError(t("Ongeldig dataformaat ontvangen."));
        }
        if (isAuthenticated) {
          const favData = await apiService.getFavorites();
          setFavorites(favData);
        }
      } catch (err: unknown) {
        console.error("Failed to load modules:", err);
        const status = err instanceof ApiError ? err.status : "MODULES_LOAD_ERROR";
        navigate("/error", {
          state: {
            title: "Kon modules niet laden",
            message: "Er ging iets mis bij het ophalen van de modules. Probeer het later opnieuw.",
            code: status,
            from: location.pathname,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate, location.pathname, t]);

  const filteredModules = useMemo(() => {
    return allModules.filter((module) => {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm || module.name.toLowerCase().includes(lowerCaseSearch);

      let matchesTags = true;
      if (selectedTags.length > 0) {
        const getModuleTags = (mod: IChoiceModule) => {
          const tags = new Set<string>();
          if (mod.location) tags.add(mod.location.trim());
          if (mod.studycredit) tags.add(`${mod.studycredit} EC`);
          if (mod.taal) tags.add(mod.taal.trim());

          if (mod.main_filter) {
            try {
              const cleaned = mod.main_filter.replace(/'/g, '"');
              if (
                cleaned.trim().startsWith("[") &&
                cleaned.trim().endsWith("]")
              ) {
                const parsed: string[] = JSON.parse(cleaned);
                parsed.forEach((tag) => tags.add(tag));
              } else {
                mod.main_filter.split(",").forEach((tag) => tags.add(tag.trim()));
              }
            } catch {
              tags.add(mod.main_filter.trim());
            }
          }
          return tags;
        };

        const moduleTags = getModuleTags(module);
        matchesTags = selectedTags.every((tag) => moduleTags.has(tag));
      }
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

    return { currentModules, totalPages };
  }, [filteredModules, currentPage]);

  // Sync page if out of bounds
  useEffect(() => {
    const totalItems = filteredModules.length;
    const calcTotalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (currentPage > calcTotalPages && calcTotalPages > 0) {
      setSearchParams(
        (prev: URLSearchParams) => {
          prev.set("page", calcTotalPages.toString());
          return prev;
        },
        { replace: true }
      );
    }
  }, [filteredModules.length, currentPage, setSearchParams]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchParams(
      (prev: URLSearchParams) => {
        if (value) {
          prev.set("search", value);
        } else {
          prev.delete("search");
        }
        prev.set("page", "1");
        return prev;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  const handlePageChange = useCallback((pageNumber: number) => {
    setSearchParams((prev: URLSearchParams) => {
      prev.set("page", pageNumber.toString());
      return prev;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setSearchParams]);

  const handleDetailsClick = useCallback((id: string) => {
    navigate(`/modules/${id}`);
  }, [navigate]);

  const handleToggleFavorite = async (moduleId: string) => {
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
    } catch (err: unknown) {
      console.error("Fout bij updaten favoriet:", err);
    }
  };

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setSearchParams(
      (prev: URLSearchParams) => {
        prev.set("page", "1");
        return prev;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <div className="page-hero">
        <h1 className="page-hero-title hero-title-shadow">
          {t("Beschikbare Keuzemodules")}
        </h1>
      </div>

      <div className="container" style={{ marginTop: "40px" }}>
        <p className="page-intro">
          {t(
            "Kies uit een breed aanbod van modules om je skills te verbeteren."
          )}
        </p>

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

      {!loading && !error && totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}

      {!loading && !error && filteredModules.length === 0 && (
        <div className="text-center p-6 text-gray-500">
          {t("Er zijn geen modules gevonden die overeenkomen met")} "
          {searchTerm}".
        </div>
      )}

      {/* Recently Viewed Section */}
      <RecentlyViewed />
    </div>
  );
};

export default ElectiveModules;
