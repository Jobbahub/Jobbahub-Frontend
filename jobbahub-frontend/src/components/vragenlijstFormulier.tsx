import React, { useState, useMemo, useEffect } from 'react';

import LoadingSpinner from './loadingSpinner';
import { apiService, ApiError } from '../services/apiService';
import type { VragenlijstData, AIRecommendation, ClusterRecommendation } from '../types/questionnaire';
import { IChoiceModule } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { TOPICS as SHARED_TOPICS } from '../data/constants';

interface VragenlijstFormulierProps {
  onComplete: (
    aiRecs: AIRecommendation[],
    dbModules: IChoiceModule[],
    formData: VragenlijstData,
    clusterRecs?: ClusterRecommendation[]
  ) => void;
}

// Type for form field values
type VragenlijstFieldValue = string | number | null;



// ✅ SECURITY: Validate and sanitize select values
const sanitizeSelectValue = (value: string, allowedValues: string[]): string | null => {
  if (value === '' || value === null) return null;
  // Only allow predefined values
  return allowedValues.includes(value) ? value : null;
};

const VragenlijstFormulier: React.FC<VragenlijstFormulierProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [topicIndex, setTopicIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Allowed values for select inputs
  const ALLOWED_TAAL = ['Nederlands', 'Engels'];
  const ALLOWED_LOCATIE = ['Den Bosch', 'Breda'];
  const ALLOWED_PUNTEN = [15, 30];

  // Memoize topics to use translations
  const TOPICS = useMemo(() => {
    return SHARED_TOPICS.map(topic => ({
      ...topic,
      label: t(topic.label),
      question: t(topic.question)
    }));
  }, [t]);

  // Initialize with default weights
  const [formData, setFormData] = useState<VragenlijstData>(() => ({
    keuze_taal: null,
    keuze_locatie: null,
    keuze_punten: null,
    knoppen_input: SHARED_TOPICS.reduce((acc, topic) => ({
      ...acc,
      ...acc,
      [topic.id]: { score: 0 }
    }), {})
  }));

  const handleChange = (field: keyof VragenlijstData, value: VragenlijstFieldValue) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  const handleScoreChange = (topicId: string, score: number) => {
    // ✅ SECURITY: Validate score is within allowed range
    if (![-1, 0, 1].includes(score)) return;

    setFormData(prev => ({
      ...prev,
      knoppen_input: {
        ...prev.knoppen_input,
        [topicId]: { ...prev.knoppen_input[topicId], score }
      }
    }));
  };



  const nextQuestion = () => {
    if (topicIndex < TOPICS.length - 1) {
      setTopicIndex(prev => prev + 1);
    } else {
      setStep(3);
    }
  };

  const prevQuestion = () => {
    if (topicIndex > 0) {
      setTopicIndex(prev => prev - 1);
    } else {
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError(null);

    try {
      // ✅ SECURITY: Sanitize all user input before sending to API
      const sanitizedData: VragenlijstData = {
        keuze_taal: formData.keuze_taal
          ? sanitizeSelectValue(formData.keuze_taal, ALLOWED_TAAL)
          : null,
        keuze_locatie: formData.keuze_locatie
          ? sanitizeSelectValue(formData.keuze_locatie, ALLOWED_LOCATIE)
          : null,
        keuze_punten: formData.keuze_punten !== null && ALLOWED_PUNTEN.includes(formData.keuze_punten)
          ? formData.keuze_punten
          : null,
        knoppen_input: formData.knoppen_input, // Already validated via handleScoreChange
      };

      const modules = await apiService.getModules();
      const aiResponse = await apiService.verstuurVragenlijst(sanitizedData);

      if (aiResponse && aiResponse.aanbevelingen) {
        onComplete(
          aiResponse.aanbevelingen,
          modules,
          sanitizedData, // Pass sanitized data
          aiResponse.cluster_suggesties
        );
      } else {
        onComplete([], modules, sanitizedData, []);
      }
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof ApiError && error.message
        ? error.message
        : "Er ging iets mis bij het ophalen van de aanbevelingen. Controleer je internetverbinding en probeer het opnieuw.";

      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container loading-container">
        <LoadingSpinner size="large" />
        <h2 className="form-title">{t('loading')}</h2>
        <p className="form-description loading-text">
          {t('ai_analyzing')}
        </p>
      </div>
    );
  }



  // Step 1: Introduction
  if (step === 1) {
    return (
      <div className="form-container form-container-wide">
        <h2 className="form-title">{t('intro_title')}</h2>
        <p className="form-description">{t('intro_subtitle')}</p>

        <div className="intro-image-placeholder">
          🚀
        </div>

        <div className="nav-buttons-container">
          <button className="btn btn-primary w-full" onClick={() => setStep(2)}>
            {t('start_questionnaire')} →
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Questions Loop
  if (step === 2) {
    const topic = TOPICS[topicIndex];
    const currentScore = formData.knoppen_input[topic.id]?.score;
    const progressPercentage = ((topicIndex + 1) / TOPICS.length) * 100;

    return (
      <div className="container question-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div className="form-container form-container-full">
          <div className="question-header-row">
            <span className="question-counter">{t("Onderwerp")} {topicIndex + 1} {t("van")} {TOPICS.length}</span>
          </div>

          <h2 className="form-title question-title">{topic.question}</h2>
          <div className="topic-btn-group">
            <button
              type="button"
              className={`btn topic-btn btn-topic-choice ${currentScore === -1 ? 'active' : ''}`}
              onClick={() => handleScoreChange(topic.id, -1)}
            >
              {t("Nee")}
            </button>
            <button
              type="button"
              className={`btn topic-btn btn-topic-choice ${currentScore === 0 ? 'active' : ''}`}
              onClick={() => handleScoreChange(topic.id, 0)}
            >
              {t("Neutraal")}
            </button>
            <button
              type="button"
              className={`btn topic-btn btn-topic-choice ${currentScore === 1 ? 'active' : ''}`}
              onClick={() => handleScoreChange(topic.id, 1)}
            >
              {t("Ja")}
            </button>
          </div>
          <div className="nav-buttons-container">
            <button className="btn btn-secondary" onClick={prevQuestion}>← {t('previous')}</button>
            <button className="btn btn-primary" onClick={nextQuestion}>{t('next')} →</button>
          </div>

          {/* Visual Timeline (Interactive & Paginated) */}
          {/* Visual Timeline (Responsive & Interactive) */}
          <div className="timeline-container">
            {(() => {
              const total = TOPICS.length;
              let visibleTopics = TOPICS; // Default: Show all (Desktop)
              let start = 0;

              // Mobile: Sliding Window logic
              if (isMobile) {
                const windowSize = 5;
                start = Math.max(0, topicIndex - Math.floor(windowSize / 2));
                let end = Math.min(total, start + windowSize);

                if (end - start < windowSize) {
                  start = Math.max(0, end - windowSize);
                }
                visibleTopics = TOPICS.slice(start, Math.min(total, start + windowSize));
              }

              return (
                <>
                  {isMobile && start > 0 && <span style={{ color: '#9ca3af' }}>...</span>}

                  {visibleTopics.map((t, i) => {
                    const realIndex = isMobile ? start + i : i; // Correct index for map
                    const score = formData.knoppen_input[t.id]?.score;

                    let className = 'timeline-bubble';

                    if (score === 1) className += ' answered-yes';
                    else if (score === 0) className += ' answered-neutral';
                    else if (score === -1) className += ' answered-no';
                    else className += ' unanswered';

                    // Current question highlight
                    if (realIndex === topicIndex) {
                      className += ' current';
                    }

                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTopicIndex(realIndex)}
                        title={`Ga naar vraag ${realIndex + 1}`}
                        className={className}
                      >
                        {realIndex + 1}
                      </button>
                    );
                  })}

                  {isMobile && (start + visibleTopics.length) < total && <span style={{ color: '#9ca3af' }}>...</span>}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }



  // Step 3: Final Preferences (Open Question & Metadata)
  if (step === 3) {
    return (
      <div className="form-container form-container-wide">
        <h2 className="form-title">{t('Persoonlijke Gegevens')}</h2>
        <p className="form-description">{t("Heb je nog specifieke wensen?")}</p>
        <div className="login-form">

          {/* Voorkeuren */}
          <div className="form-group-row-grid">
            <div className="form-group">
              <label className="form-label">{t("Taal")}</label>
              <select
                className="form-input"
                value={formData.keuze_taal || ""}
                onChange={(e) => handleChange('keuze_taal', e.target.value === "" ? null : e.target.value)}
              >
                <option value="">{t("Geen voorkeur")}</option>
                <option value="Nederlands">{t("Nederlands")}</option>
                <option value="Engels">{t("Engels")}</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t("Locatie")}</label>
              <select
                className="form-input"
                value={formData.keuze_locatie || ""}
                onChange={(e) => handleChange('keuze_locatie', e.target.value === "" ? null : e.target.value)}
              >
                <option value="">{t("Geen voorkeur")}</option>
                <option value="Den Bosch">{t("Den Bosch")}</option>
                <option value="Breda">{t("Breda")}</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t("Studiepunten")}</label>
              <select
                className="form-input"
                value={formData.keuze_punten || ""}
                onChange={(e) => handleChange('keuze_punten', e.target.value === "" ? null : parseInt(e.target.value))}
              >
                <option value="">{t("Geen voorkeur")}</option>
                <option value={15}>{t("15 EC")}</option>
                <option value={30}>{t("30 EC")}</option>
              </select>
            </div>
          </div>


          <div className="nav-buttons-container">
            {submitError && (
              <div className="error-banner">
                {t(submitError)}
                <button
                  onClick={() => setSubmitError(null)}
                  className="error-close-btn"
                >
                  ✕
                </button>
              </div>
            )}
            <button className="btn btn-secondary w-full btn-margin-right" onClick={() => setStep(2)}>← {t('previous')}</button>
            <button className="btn btn-primary w-full" onClick={handleSubmit}>{t('submit')}</button>
          </div>
        </div>
      </div >
    );
  }

  return null;
};

export default VragenlijstFormulier;
