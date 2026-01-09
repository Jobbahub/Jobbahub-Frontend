import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { IChoiceModule } from '../types';
import CategoryComparisonChart from './CategoryComparisonChart';

interface ModuleCardProps {
  module: IChoiceModule;
  onClick: (id: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  isAuthenticated?: boolean;
  matchPercentage?: number | null;
  explanation?: string;
  isCluster?: boolean;
  categoryScores?: Record<string, number>;
  userAnswers?: any;
  rank?: number;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  onClick,
  isFavorite,
  onToggleFavorite,
  isAuthenticated,
  matchPercentage,
  explanation,
  isCluster,
  categoryScores,
  userAnswers,
  rank
}) => {
  const { t, language } = useLanguage();
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const getTranslatedContent = (key: 'name' | 'shortdescription' | 'description', fallback?: string) => {
    if (language === 'en') {
      const enKey = `${key}_en` as keyof IChoiceModule;
      if (module[enKey]) return module[enKey] as string;
    }
    return module[key] as string || fallback || '';
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(module._id);
    }
  };

  const handleToggleTags = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTagsExpanded(!tagsExpanded);
  };

  const parseTags = (tagString?: string): string[] => {
    if (!tagString) return [];
    try {
      return tagString.replace(/[\[\]']/g, '').split(',').map(t => t.trim()).filter(t => t !== "");
    } catch {
      return [];
    }
  };

  const tags = parseTags(module.tags_list);
  const imageUrl = `https://picsum.photos/id/${module.id % 1084}/600/400`;

  return (
    <div className="card clickable-card" onClick={() => onClick(String(module.id))}>

      <div className="result-card-image-wrapper">
        {isAuthenticated && onToggleFavorite && (
          <button
            className={`btn-favorite-card ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            title={isFavorite ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
          >
            {isFavorite ? '♥' : '♡'}
          </button>
        )}

        <img
          src={imageUrl}
          alt={module.name}
          className="card-image"
        />

        {rank ? (
          <span className="match-badge">
            #{rank}
          </span>
        ) : (
          matchPercentage !== undefined && matchPercentage !== null && (
            <span className="match-badge">
              {matchPercentage}% Match
            </span>
          )
        )}

        {isCluster && (
          <span className="match-badge badge-cluster-color">
            Populair in Cluster
          </span>
        )}
      </div>

      <div className="card-body">
        <h3 className="card-title">{getTranslatedContent('name')}</h3>

        <div className="card-tags-container">
          {module.main_filter && (
            <span className="tag-main">{module.main_filter}</span>
          )}

          {tags.length > 0 && (
            <button
              className={`tag-toggle-btn ${tagsExpanded ? 'expanded' : ''}`}
              onClick={handleToggleTags}
              title={tagsExpanded ? "Verberg tags" : "Toon alle tags"}
            >
              {'>'}
            </button>
          )}

          {tagsExpanded && tags.map((tag, index) => (
            <span key={index} className="tag-secondary">{tag}</span>
          ))}
        </div>

        {explanation && (
          <div className={`why-box ${isCluster ? 'why-box-cluster' : ''}`}>
            <strong>{t ? t('why') : 'Waarom'}:</strong> {explanation}
          </div>
        )}

        {categoryScores && userAnswers && (
          <CategoryComparisonChart moduleScores={categoryScores} userAnswers={userAnswers} />
        )}

        <div className="mb-2">
          <h5 className="text-sm font-bold text-slate-700">Short description</h5>
          <p className="card-text">
            {getTranslatedContent('shortdescription') || (getTranslatedContent('description') ? getTranslatedContent('description').substring(0, 100) + '...' : '')}
          </p>
        </div>

        <div className="card-meta">
          <span className="credits">{module.studycredit} EC</span>
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;