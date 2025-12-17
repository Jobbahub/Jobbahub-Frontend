import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IChoiceModule } from '../types';
import { apiService } from '../services/apiService';

const ModuleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [module, setModule] = useState<IChoiceModule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModule = async () => {
      if (!id) return;
      try {
        const data = await apiService.getModuleById(id);
        setModule(data);
      } catch (err) {
        setError("Kon de module niet laden.");
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [id]);

  // Hulpfunctie om de tags string "['tag', 'tag']" om te zetten naar een array
  const parseTags = (tagString?: string): string[] => {
    if (!tagString) return [];
    try {
      // Verwijdert haakjes en enkele quotes en splitst op komma
      return tagString.replace(/[\[\]']/g, '').split(',').map(t => t.trim()).filter(t => t !== "");
    } catch {
      return [];
    }
  };

  // Hulpfunctie voor datum notatie (bv. 14 november 2025)
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nader te bepalen';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  if (loading) return <div className="container" style={{padding: '40px'}}>Laden...</div>;
  if (error || !module) return <div className="container form-error">{error || "Module niet gevonden"}</div>;

  const tags = parseTags(module.module_tags);

  return (
    <div className="container">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/modules')} 
        className="btn btn-secondary"
        style={{ marginBottom: '20px', marginTop: '20px' }}
      >
        ← Terug naar overzicht
      </button>

      <div className="detail-wrapper">
        {/* Header Section */}
        <div className="detail-header">
           <img 
            src='https://placehold.co/1200x300?text=Module+Header'
            alt={module.name} 
            className="detail-hero-image"
          />
          <div className="detail-title-box">
            <h1 className="detail-title">{module.name}</h1>
            <div className="badge-container">
              {tags.map((tag, index) => (
                <span key={index} className="badge">{tag}</span>
              ))}
              {/* Extra badge voor niveau als die er is */}
              {module.level && <span className="badge" style={{background: '#e0e7ff', color: '#3730a3'}}>{module.level}</span>}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="detail-grid">
          {/* Left Column: Main Info */}
          <div className="detail-main">
            {/* Korte introductie */}
            <p style={{fontSize: '1.2rem', color: '#4b5563', marginBottom: '30px', fontStyle: 'italic'}}>
                {module.shortdescription}
            </p>

            <section className="detail-section">
              <h3>Inhoud</h3>
              {/* Als description en content hetzelfde zijn, toon er maar één, anders beide */}
              <p>{module.content || module.description}</p>
            </section>

            {module.learningoutcomes && (
              <section className="detail-section">
                <h3>Leeruitkomsten</h3>
                <p>{module.learningoutcomes}</p>
              </section>
            )}
          </div>

          {/* Right Column: Sidebar Info */}
          <div className="detail-sidebar">
            <div className="sidebar-card">
              <h4>Module Details</h4>
              <ul className="detail-list">
                <li>
                  <strong>Studiepunten:</strong> 
                  <span>{module.studycredit} EC</span>
                </li>
                <li>
                  <strong>Locatie:</strong> 
                  <span>{module.location || 'Niet opgegeven'}</span>
                </li>
                <li>
                  <strong>Startdatum:</strong> 
                  <span>{formatDate(module.start_date)}</span>
                </li>
                <li>
                  <strong>Beschikbare plaatsen:</strong> 
                  <span>{module.available_spots ?? '-'}</span>
                </li>
                <li>
                  <strong>Moeilijkheidsgraad:</strong> 
                  <span>{module.estimated_difficulty ? `${module.estimated_difficulty}/10` : '-'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;