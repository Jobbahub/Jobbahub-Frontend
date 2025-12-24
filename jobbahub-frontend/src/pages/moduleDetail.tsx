import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IChoiceModule } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/authContext';
import { useLanguage } from '../context/LanguageContext';

const getHeroImageUrl = (id: number) => {
  const picsumId = id % 1084;
  return `https://picsum.photos/id/${picsumId}/1200/400`;
};

const ModuleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();

  const getTranslatedContent = (key: 'name' | 'shortdescription' | 'description' | 'content' | 'learningoutcomes', fallback?: string) => {
    if (!module) return '';
    if (language === 'en') {
      const enKey = `${key}_en` as keyof IChoiceModule;
      if (module[enKey]) return module[enKey] as string;
    }
    return module[key] as string || fallback || '';
  };

  const [module, setModule] = useState<IChoiceModule | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModuleAndFav = async () => {
      if (!id) return;
      try {
        const data = await apiService.getModuleById(id);
        setModule(data);

        if (isAuthenticated && data) {
          const favorites = await apiService.getFavorites();
          setIsFavorite(favorites.includes(data._id));
        }
      } catch (err) {
        setError("Kon de module niet laden.");
      } finally {
        setLoading(false);
      }
    };

    fetchModuleAndFav();
  }, [id, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!module || !isAuthenticated) return;
    try {
      if (isFavorite) {
        await apiService.removeFavorite(module._id);
        setIsFavorite(false);
      } else {
        await apiService.addFavorite(module._id);
        setIsFavorite(true);
      }
    } catch (e) {
      console.error("Fout bij favoriet togglen", e);
    }
  };

  const parseTags = (tagString?: string): string[] => {
    if (!tagString) return [];
    try {
      return tagString.replace(/[\[\]']/g, '').split(',').map(t => t.trim()).filter(t => t !== "");
    } catch { return []; }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nader te bepalen';
    return new Date(dateString).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) return <div className="container loading-simple">{t("loading")}</div>;
  if (error || !module) return <div className="container form-error">{error || t("Ongeldig dataformaat ontvangen.")}</div>;

  const tags = parseTags(module.tags_list);
  const heroImageUrl = getHeroImageUrl(module.id);

  return (
    <div className="page-wrapper">
      <div className="page-hero" style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${heroImageUrl})`,
      }}>
        <h1 className="page-hero-title hero-title-shadow">
          {getTranslatedContent('name')}
        </h1>
      </div>

      <div className="container detail-container-offset">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-margin-bottom"
        >
          ← {t("back")}
        </button>

        <div className="detail-wrapper">
          <div className="detail-header">
            {isAuthenticated && (
              <button
                onClick={handleToggleFavorite}
                className={`btn-favorite-detail ${isFavorite ? 'active' : ''}`}
              >
                {isFavorite ? '♥' : '♡'}
              </button>
            )}

            <div className="detail-title-box">
              <h1 className="detail-title">{getTranslatedContent('name')}</h1>
              <div className="badge-container">
                {module.main_filter && (
                  <span className="badge" style={{ background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                    {module.main_filter}
                  </span>
                )}
                {tags.map((tag, index) => (
                  <span key={index} className="badge">{tag}</span>
                ))}
                {module.level && <span className="badge badge-level">{module.level}</span>}
              </div>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-main">
              <p className="detail-intro-text">
                {getTranslatedContent('shortdescription')}
              </p>

              <section className="detail-section">
                <h3>{t("Inhoud")}</h3>
                <p>{getTranslatedContent('content') || getTranslatedContent('description')}</p>
              </section>

              {module.learningoutcomes && (
                <section className="detail-section">
                  <h3>{t("Leeruitkomsten")}</h3>
                  <p>{getTranslatedContent('learningoutcomes')}</p>
                </section>
              )}
            </div>

            <div className="detail-sidebar">
              <div className="sidebar-card">
                <h4>{t("Module Details")}</h4>
                <ul className="detail-list">
                  <li><strong>{t("Studiepunten")}:</strong> <span>{module.studycredit} EC</span></li>
                  <li><strong>{t("Locatie")}:</strong> <span>{module.location || t("Onbekend")}</span></li>
                  <li><strong>{t("Startdatum")}:</strong> <span>{formatDate(module.start_date)}</span></li>
                  <li><strong>{t("Beschikbare plaatsen")}:</strong> <span>{module.available_spots ?? '-'}</span></li>
                  <li><strong>{t("Moeilijkheidsgraad")}:</strong> <span>{module.estimated_difficulty ? `${module.estimated_difficulty}/5` : '-'}</span></li>
                </ul>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;