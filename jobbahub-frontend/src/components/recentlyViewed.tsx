import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IChoiceModule } from '../types';
import { apiService } from '../services/apiService';
import { useLanguage } from '../context/LanguageContext';
import useRecentlyViewed from '../hooks/useRecentlyViewed';
import LoadingSpinner from './loadingSpinner';

interface RecentlyViewedProps {
  excludeModuleId?: string; // Optionally exclude current module from the list
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ excludeModuleId }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { recentlyViewedIds } = useRecentlyViewed();

  const [modules, setModules] = useState<IChoiceModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      if (recentlyViewedIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const allModules = await apiService.getModules();

        // Filter to only recently viewed and maintain order
        const filteredIds = excludeModuleId
          ? recentlyViewedIds.filter(id => id !== excludeModuleId)
          : recentlyViewedIds;

        const recentModules = filteredIds
          .map(id => allModules.find(m => m.id === parseInt(id, 10)))
          .filter((m): m is IChoiceModule => m !== undefined)
          .slice(0, 5);

        setModules(recentModules);
      } catch (error) {
        console.error('Error fetching recently viewed modules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [recentlyViewedIds, excludeModuleId]);

  const handleModuleClick = (id: string | number) => {
    navigate(`/modules/${id}`);
  };

  // Don't render if no modules to show
  if (!loading && modules.length === 0) {
    return null;
  }

  return (
    <div className="recently-viewed-section">
      <div className="container">
        <h2 className="recently-viewed-title">{t("Laatst bekeken")}</h2>

        {loading ? (
          <div className="recently-viewed-loading">
            <LoadingSpinner size="small" />
          </div>
        ) : (
          <div className="recently-viewed-grid">
            {modules.map((module) => (
              <div
                key={module.id}
                className="recently-viewed-card"
                onClick={() => handleModuleClick(module.id)}
              >
                <div className="recently-viewed-card-content">
                  <h3 className="recently-viewed-card-title">{module.name}</h3>
                  <div className="recently-viewed-card-meta">
                    <span className="recently-viewed-badge">{module.studycredit} EC</span>
                    {module.location && (
                      <span className="recently-viewed-location">{module.location}</span>
                    )}
                  </div>
                </div>
                <div className="recently-viewed-card-arrow">→</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentlyViewed;