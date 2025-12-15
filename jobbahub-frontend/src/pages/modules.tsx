import React, { useEffect, useState } from 'react';
import { IChoiceModule } from '../types';
import { apiService } from '../services/apiService';
import ModuleGrid from '../components/moduleGrid';

const ElectiveModules: React.FC = () => {
  const [modules, setModules] = useState<IChoiceModule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    console.log("Klik op module:", id);
    // Navigatie logica komt later hier
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Beschikbare Keuzemodules</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
        Kies uit een breed aanbod van modules om je skills te verbeteren.
      </p>

      {/* De pagina delegeert nu alles aan het Grid component */}
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