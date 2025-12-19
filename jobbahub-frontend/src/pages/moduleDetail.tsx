import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IChoiceModule } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/authContext';

const getHeroImageUrl = (id: number) => {
    const picsumId = id % 1084;
    return `https://picsum.photos/id/${picsumId}/1200/400`;
};

const ModuleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
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

  if (loading) return <div className="container" style={{padding: '40px'}}>Laden...</div>;
  if (error || !module) return <div className="container form-error">{error || "Module niet gevonden"}</div>;

  const tags = parseTags(module.module_tags);
  const heroImageUrl = getHeroImageUrl(module.id);

  return (
    <div className="page-wrapper">
      {/* Hero Section with Module Image */}
      <div className="page-hero" style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${heroImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '300px'
      }}>
        <h1 className="page-hero-title" style={{ color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          {module.name}
        </h1>
      </div>

      <div className="container" style={{ marginTop: '40px' }}>
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-secondary"
          style={{ marginBottom: '20px' }}
        >
          ← Terug
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
              <div className="badge-container">
                {tags.map((tag, index) => (
                  <span key={index} className="badge">{tag}</span>
                ))}
                {module.level && <span className="badge" style={{background: '#e0e7ff', color: '#3730a3'}}>{module.level}</span>}
              </div>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-main">
              <p className="detail-intro-text">
                {module.shortdescription}
              </p>

              <section className="detail-section">
                <h3>Inhoud</h3>
                <p>{module.content || module.description}</p>
              </section>

              {module.learningoutcomes && (
                <section className="detail-section">
                  <h3>Leeruitkomsten</h3>
                  <p>{module.learningoutcomes}</p>
                </section>
              )}
            </div>

            <div className="detail-sidebar">
              <div className="sidebar-card">
                <h4>Module Details</h4>
                <ul className="detail-list">
                  <li><strong>Studiepunten:</strong> <span>{module.studycredit} EC</span></li>
                  <li><strong>Locatie:</strong> <span>{module.location || 'Niet opgegeven'}</span></li>
                  <li><strong>Startdatum:</strong> <span>{formatDate(module.start_date)}</span></li>
                  <li><strong>Beschikbare plaatsen:</strong> <span>{module.available_spots ?? '-'}</span></li>
                  <li><strong>Moeilijkheidsgraad:</strong> <span>{module.estimated_difficulty ? `${module.estimated_difficulty}/10` : '-'}</span></li>
                </ul>
                
                <button className="btn btn-primary w-full" style={{marginTop: '20px'}}>
                  Inschrijven
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;