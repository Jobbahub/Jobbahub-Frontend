import React, { useEffect, useState } from 'react';
import { IChoiceModule } from '../types';
import { apiService } from '../services/apiService';

const ElectiveModules: React.FC = () => {
  // 1. Initialize with an empty array
  const [modules, setModules] = useState<IChoiceModule[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getModules();
        // 2. Extra safety check: Ensure data is an array before setting it
        if (Array.isArray(data)) {
            setModules(data);
        } else {
            console.error("API did not return an array:", data);
            setModules([]); // Fallback to empty array
            setError("Ongeldig dataformaat ontvangen van server.");
        }
      } catch (err) {
        console.error("Error in fetchData:", err);
        setError("Kon de modules niet laden. Probeer het later opnieuw.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-6 text-center">Laden...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Beschikbare Keuzemodules</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
        Kies uit een breed aanbod van modules om je skills te verbeteren.
      </p>

      <div className="grid-container">
        {/* 3. Safety check: Only map if modules exists and has length */}
        {modules && modules.length > 0 ? (
          modules.map((module) => (
            <div key={module._id} className="card">
              
              {module.image && (
                <img 
                  src={module.image} 
                  alt={module.name} 
                  className="card-image"
                />
              )}
              
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <div className="badge-container">
                    {/* 4. Safety check for tags mapping as well */}
                    {module.tags && module.tags.map(tag => (
                      <span key={tag.id} className="badge">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <span className="credits">
                    {module.studycredit} EC
                  </span>
                </div>

                <h3 className="card-title">{module.name}</h3>
                
                <p className="card-text">
                  {module.shortdescription || module.description}
                </p>

                <button className="btn btn-secondary" style={{ width: '100%' }}>
                  Bekijk Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>Geen modules gevonden.</p>
        )}
      </div>
    </div>
  );
};

export default ElectiveModules;