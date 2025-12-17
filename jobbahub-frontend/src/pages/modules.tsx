// ElectiveModules.tsx (Versie met Zoekfunctionaliteit en Paginering)

import React, { useEffect, useState, useMemo } from 'react';
import { IChoiceModule } from '../types';
import { apiService } from '../services/apiService';
import ModuleGrid from '../components/moduleGrid';
import Pagination from '../components/modulePagination'; 
import ModuleSearch from '../components/moduleSearch'; // <-- Importeer de Zoekcomponent
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ITEMS_PER_PAGE = 8; 

const ElectiveModules: React.FC = () => {
  const [allModules, setAllModules] = useState<IChoiceModule[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 1. Nieuwe State voor Zoekterm
  const [searchTerm, setSearchTerm] = useState('');
  // State voor Paginering
  const [currentPage, setCurrentPage] = useState(1);
  
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


  // 2. FILTEREN: Stap om de modules te filteren op basis van de zoekterm
  const filteredModules = useMemo(() => {
    if (!searchTerm) {
      return allModules; // Geen zoekterm = alle modules
    }
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
    // Filter logica: filter op module naam (en optioneel andere velden)
    return allModules.filter(module => 
      module.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      (module.description && module.description.toLowerCase().includes(lowerCaseSearchTerm))
      // Voeg hier andere velden toe om op te zoeken (bijv. tags)
    );
  }, [allModules, searchTerm]);


  // 3. PAGINERING: Gebruik de GEFILTERDE modules om de paginering te berekenen
  const { currentModules, totalPages } = useMemo(() => {
    const totalItems = filteredModules.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

    // Snijd de array om alleen de modules voor de huidige pagina te krijgen
    const currentModules = filteredModules.slice(indexOfFirstItem, indexOfLastItem);

    // Correctie logica: ga terug naar laatste pagina als de huidige leeg is
    if (currentModules.length === 0 && totalPages > 0) {
        setCurrentPage(totalPages);
        return { currentModules: filteredModules.slice(totalPages * ITEMS_PER_PAGE - ITEMS_PER_PAGE, totalPages * ITEMS_PER_PAGE), totalPages };
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
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
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
    <div>
      <div className="container">
        <h1 className="page-header">Beschikbare Keuzemodules</h1>
        <p className="page-intro">
          Kies uit een breed aanbod van modules om je skills te verbeteren.
        </p>
        
        {/* Voeg de zoekbalk toe */}
        <ModuleSearch 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        
      </div>

      <ModuleGrid 
        modules={currentModules} // Geef de gepagineerde én gefilterde modules mee
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
      {!loading && !error && filteredModules.length === 0 && (
          <div className="text-center p-6 text-gray-500">
              Er zijn geen modules gevonden die overeenkomen met "{searchTerm}".
          </div>
      )}
    </div>
  );
};

export default ElectiveModules;