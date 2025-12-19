import React, { useEffect, useState, useMemo } from 'react';
import { IChoiceModule } from '../types';
import { apiService } from '../services/apiService';
import ModuleGrid from '../components/moduleGrid';
import Pagination from '../components/modulePagination'; 
import ModuleSearch from '../components/moduleSearch';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ITEMS_PER_PAGE = 8; 

const ElectiveModules: React.FC = () => {
  const [allModules, setAllModules] = useState<IChoiceModule[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
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

    if (currentModules.length === 0 && totalPages > 0) {
        setCurrentPage(totalPages);
        return { currentModules: filteredModules.slice(totalPages * ITEMS_PER_PAGE - ITEMS_PER_PAGE, totalPages * ITEMS_PER_PAGE), totalPages };
    }

    return { currentModules, totalPages };
  }, [filteredModules, currentPage]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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