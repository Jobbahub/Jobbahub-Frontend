import React, { useEffect, useState } from 'react';
import { IChoiceModule } from '../types';
import { apiService } from '../services/apiService';
import ModuleGrid from '../components/moduleGrid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ElectiveModules: React.FC = () => {
  const [modules, setModules] = useState<IChoiceModule[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modulesData = await apiService.getModules();
        if (Array.isArray(modulesData)) {
          setModules(modulesData);
        } else {
          setModules([]);
        }

        if (isAuthenticated) {
          const favData = await apiService.getFavorites();
          setFavorites(favData);
        }
      } catch (err) {
        setError("Kon de modules niet laden.");
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
      </div>

      <ModuleGrid 
        modules={modules} 
        loading={loading} 
        error={error} 
        onViewDetails={handleDetailsClick}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default ElectiveModules;