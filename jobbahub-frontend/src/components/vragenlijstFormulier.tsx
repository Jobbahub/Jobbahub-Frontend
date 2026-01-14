import React, { useState, useMemo } from 'react';
import DOMPurify from 'dompurify';
import LoadingSpinner from './LoadingSpinner';
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

// ✅ SECURITY: Sanitize user input to prevent XSS
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
  }).trim();
};

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
    open_antwoord: '',
    knoppen_input: SHARED_TOPICS.reduce((acc, topic) => ({
      ...acc,
      ...acc,
      [topic.id]: { score: 0 }
    }), {})
  }));

  const handleChange = (field: keyof VragenlijstData, value: VragenlijstFieldValue) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ✅ SECURITY: Sanitized handler for text input
  const handleTextChange = (field: keyof VragenlijstData, value: string) => {
    // Limit input length to prevent DoS
    const maxLength = 1000;
    const truncatedValue = value.slice(0, maxLength);
    setFormData(prev => ({ ...prev, [field]: truncatedValue }));
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
        open_antwoord: sanitizeInput(formData.open_antwoord),
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

        <div className="intro-image-placeholder" style={{
          margin: '2rem 0',
          display: 'flex',
          justifyContent: 'center',
          fontSize: '4rem'
        }}>
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
        <div className="flex justify-end mb-4 absolute top-4 right-4">
          {/* Language switcher placeholder */}
        </div>
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

          <div className="form-group">
            <label className="form-label">{t("Jouw gedachten (Optioneel)")}</label>
            <textarea
              className="form-input"
              rows={4}
              maxLength={1000}
              placeholder={t("Bijvoorbeeld: Ik wil graag iets doen met AI en duurzaamheid...")}
              value={formData.open_antwoord}
              onChange={(e) => handleTextChange('open_antwoord', e.target.value)}
            />
            <small className="text-muted">{formData.open_antwoord.length}/1000</small>
          </div>
          <div className="nav-buttons-container">
            {submitError && (
              <div style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                padding: '12px 24px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 9999,
                border: '1px solid #fecaca',
                fontWeight: 500,
                minWidth: '300px',
                textAlign: 'center',
                animation: 'fadeIn 0.3s ease-in-out'
              }}>
                {t(submitError)}
                <button
                  onClick={() => setSubmitError(null)}
                  style={{ marginLeft: '15px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#991b1b' }}
                >
                  ✕
                </button>
              </div>
            )}
            <button className="btn btn-secondary w-full btn-margin-right" onClick={() => setStep(2)}>← {t('previous')}</button>
            <button className="btn btn-primary w-full" onClick={handleSubmit}>{t('submit')}</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VragenlijstFormulier;
