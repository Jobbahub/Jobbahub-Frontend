import React, { useEffect, useState } from 'react';
import { IChoiceModule } from '../types';
import { apiService } from '../services/apiService';
import ModuleGrid from '../components/moduleGrid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const Favorites: React.FC = () => {
  const [favoriteModules, setFavoriteModules] = useState<IChoiceModule[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      // Als niet ingelogd, stuur weg of toon niets
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 1. Haal alle modules op (voor de data/plaatjes/tekst)
        const allModules = await apiService.getModules();
        
        // 2. Haal de lijst met favoriete ID's op
        const favIds = await apiService.getFavorites();
        setFavoriteIds(favIds);

        // 3. Filter: Bewaar alleen modules die in de favorietenlijst staan
        // We vergelijken module._id (de database string) met de opgeslagen favIds
        const filtered = allModules.filter(mod => favIds.includes(mod._id));
        setFavoriteModules(filtered);

      } catch (err) {
        console.error(err);
        setError("Kon favorieten niet laden.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleDetailsClick = (id: string) => {
    navigate(`/modules/${id}`);
  };

  // Deze functie zorgt dat als je op de pagina zelf een hartje uitklikt,
  // de module direct uit de lijst verdwijnt.
  const handleToggleFavorite = async (moduleId: string) => {
    try {
      // We gaan er hier vanuit dat we op deze pagina alleen VERWIJDEREN
      // want ze staan al in de favorieten.
      await apiService.removeFavorite(moduleId);
      
      // Update de state direct (optimistic UI update)
      setFavoriteIds(prev => prev.filter(id => id !== moduleId));
      setFavoriteModules(prev => prev.filter(mod => mod._id !== moduleId));
      
    } catch (error) {
      console.error("Fout bij verwijderen favoriet:", error);
    }
  };

  if (!isAuthenticated) {
    return (
        <div className="container" style={{textAlign: 'center', marginTop: '50px'}}>
            <p>Je moet ingelogd zijn om favorieten te bekijken.</p>
        </div>
    );
  }

  return (
    <div>
      <div className="container">
        <h1 className="page-header">Mijn Favorieten</h1>
        <p className="page-intro">
          Hier vind je een overzicht van de modules die jij hebt bewaard.
        </p>
      </div>

      {/* We hergebruiken hier de ModuleGrid component! */}
      <ModuleGrid 
        modules={favoriteModules} 
        loading={loading} 
        error={error} 
        onViewDetails={handleDetailsClick}
        favorites={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default Favorites;