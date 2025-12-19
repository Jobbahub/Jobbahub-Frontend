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
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const allModules = await apiService.getModules();
        const favIds = await apiService.getFavorites();
        setFavoriteIds(favIds);
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

  const handleToggleFavorite = async (moduleId: string) => {
    try {
      await apiService.removeFavorite(moduleId);
      setFavoriteIds(prev => prev.filter(id => id !== moduleId));
      setFavoriteModules(prev => prev.filter(mod => mod._id !== moduleId));
    } catch (error) {
      console.error("Fout bij verwijderen favoriet:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-wrapper">
        <div className="page-hero">
          <h1 className="page-hero-title">Mijn Favorieten</h1>
        </div>
        <div className="container" style={{textAlign: 'center', marginTop: '50px'}}>
          <p>Je moet ingelogd zijn om favorieten te bekijken.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <div className="page-hero">
        <h1 className="page-hero-title">Mijn Favorieten</h1>
      </div>

      <div className="container" style={{ marginTop: '40px' }}>
        <p className="page-intro">
          Hier vind je een overzicht van de modules die jij hebt bewaard.
        </p>
      </div>

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