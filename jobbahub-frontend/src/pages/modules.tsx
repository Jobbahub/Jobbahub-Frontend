import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IChoiceModule } from '../types';
import { apiService } from '../services/apiService';
import ModuleGrid from '../components/moduleGrid';
import Pagination from '../components/modulePagination';
import ModuleSearch from '../components/moduleSearch';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ITEMS_PER_PAGE = 9;

const ElectiveModules: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [allModules, setAllModules] = useState<IChoiceModule[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // We can still keep these as derived state or just use the params directly. 
  // Using params directly or syncing state is fine. 
  // For simplicity and reactivity, let's use the params as the source of truth for rendering,
  // but we might need local state if we want controlled inputs that don't update URL on every keystroke (debounce).
  // However, the original code updated `searchTerm` on every change. Let's keep it simple first.
  const searchTerm = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
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
    if (!searchTerm) {
      return allModules;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return allModules.filter(module =>
      module.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      (module.description && module.description.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [allModules, searchTerm]);

  const { currentModules, totalPages } = useMemo(() => {
    const totalItems = filteredModules.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

    const currentModules = filteredModules.slice(indexOfFirstItem, indexOfLastItem);

    // If we're on a page that doesn't exist anymore (e.g. after search), redirect to last valid page
    if (currentModules.length === 0 && totalPages > 0 && currentPage > totalPages) {
      // This is a side effect in render, providing a better UX requires handling this in useEffect or handlers.
      // For now, let's just show the last page logic or reset. 
      // The original code managed this via `setCurrentPage`. 
      // With URL params, we should update the URL.
      // We'll handle this in a useEffect to avoid render loops or bad patterns.
    }

    return { currentModules, totalPages };
  }, [filteredModules, currentPage]);

  // Sync page if out of bounds
  useEffect(() => {
    const totalItems = filteredModules.length;
    const calcTotalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (currentPage > calcTotalPages && calcTotalPages > 0) {
      setSearchParams((prev: URLSearchParams) => {
        prev.set('page', calcTotalPages.toString());
        return prev;
      }, { replace: true });
    }
  }, [filteredModules.length, currentPage, setSearchParams]);

  const handleSearchChange = (value: string) => {
    setSearchParams((prev: URLSearchParams) => {
      if (value) {
        prev.set('search', value);
      } else {
        prev.delete('search');
      }
      prev.set('page', '1'); // Reset to page 1 on search
      return prev;
    }, { replace: true });
  };

  const handlePageChange = (pageNumber: number) => {
    setSearchParams((prev: URLSearchParams) => {
      prev.set('page', pageNumber.toString());
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDetailsClick = (id: string) => {
    navigate(`/modules/${id}`);
  };

  const handleToggleFavorite = async (moduleId: string) => {
    if (!isAuthenticated) return;

    const isFav = favorites.includes(moduleId);
    try {
      if (isFav) {
        await apiService.removeFavorite(moduleId);
        setFavorites(prev => prev.filter(id => id !== moduleId));
      } else {
        await apiService.addFavorite(moduleId);
        setFavorites(prev => [...prev, moduleId]);
      }
    } catch (error) {
      console.error("Fout bij updaten favoriet:", error);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <div className="page-hero">
        <h1 className="page-hero-title">Beschikbare Keuzemodules</h1>
      </div>

      <div className="container" style={{ marginTop: '40px' }}>
        <p className="page-intro">
          Kies uit een breed aanbod van modules om je skills te verbeteren.
        </p>

        <ModuleSearch
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
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
          Er zijn geen modules gevonden die overeenkomen met "{searchTerm}".
        </div>
      )}
    </div>
  );
};

export default ElectiveModules;