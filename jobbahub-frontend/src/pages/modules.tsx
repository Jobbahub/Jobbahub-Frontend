import React, { useEffect, useState } from 'react';
import { IChoiceModule } from '../types';
import { apiService } from '../services/apiService';
import ModuleGrid from '../components/moduleGrid';
import { useNavigate } from 'react-router-dom'; // Import toevoegen

const ElectiveModules: React.FC = () => {
  const [modules, setModules] = useState<IChoiceModule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Hook gebruiken

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getModules();
        if (Array.isArray(data)) {
          setModules(data);
        } else {
          setModules([]);
          setError("Ongeldig dataformaat ontvangen.");
        }
      } catch (err) {
        setError("Kon de modules niet laden. Controleer of de backend draait.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDetailsClick = (id: string) => {
    navigate(`/modules/${id}`); // Navigeer naar de detailpagina
  };

  return (
    <div>
      <h1 className="page-header">Beschikbare Keuzemodules</h1>
      <p className="page-intro">
        Kies uit een breed aanbod van modules om je skills te verbeteren.
      </p>

      <ModuleGrid 
        modules={modules} 
        loading={loading} 
        error={error} 
        onViewDetails={handleDetailsClick}
      />
    </div>
  );
};

export default ElectiveModules;