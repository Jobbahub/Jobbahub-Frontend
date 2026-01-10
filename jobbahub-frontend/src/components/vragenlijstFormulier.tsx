import React, { useState, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
import { apiService, VragenlijstData, AIRecommendation, ApiError } from '../services/apiService';
import { IChoiceModule, ClusterRecommendation } from '../types';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { TOPICS as SHARED_TOPICS } from '../data/constants';

interface VragenlijstFormulierProps {
  onComplete: (
    aiRecs: AIRecommendation[],
    dbModules: IChoiceModule[],
    formData: VragenlijstData,
    clusterRecs?: ClusterRecommendation[]
  ) => void;
}

const VragenlijstFormulier: React.FC<VragenlijstFormulierProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  // const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [topicIndex, setTopicIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Memoize topics to use translations
  const TOPICS = useMemo(() => {
    return SHARED_TOPICS.map(topic => ({
      ...topic,
      // Use the topic label/question as key if possible, or defined keys. 
      // Since we use natural language keys, we can just use the Dutch text if it matches what's in SHARED_TOPICS.
      // Assuming SHARED_TOPICS contains Dutch text.
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
    knoppen_input: TOPICS.reduce((acc, topic) => ({
      ...acc,
      [topic.id]: { score: 0, weight: 1 }
    }), {})
  }));

  const handleChange = (field: keyof VragenlijstData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScoreChange = (topicId: string, score: number) => {
    setFormData(prev => ({
      ...prev,
      knoppen_input: {
        ...prev.knoppen_input,
        [topicId]: { ...prev.knoppen_input[topicId], score }
      }
    }));
  };

  const handleWeightToggle = (topicId: string) => {
    setFormData(prev => {
      const currentWeight = prev.knoppen_input[topicId].weight;
      return {
        ...prev,
        knoppen_input: {
          ...prev.knoppen_input,
          [topicId]: { ...prev.knoppen_input[topicId], weight: currentWeight === 2 ? 1 : 2 }
        }
      };
    });
  };

  const nextQuestion = () => {
    if (topicIndex < TOPICS.length - 1) {
      setTopicIndex(prev => prev + 1);
    } else {
      setStep(3); // Go to Re-confirmation step
    }
  };

  const prevQuestion = () => {
    if (topicIndex > 0) {
      setTopicIndex(prev => prev - 1);
    } else {
      setStep(1); // Back to Priority Selection
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const modules = await apiService.getModules();
      const aiResponse = await apiService.verstuurVragenlijst(formData);

      if (aiResponse && aiResponse.aanbevelingen) {
        onComplete(
          aiResponse.aanbevelingen,
          modules,
          formData,
          aiResponse.cluster_suggesties
        );
      } else {
        onComplete([], modules, formData, []);
      }
    } catch (error: any) {
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
        <div className="loading-spinner"></div>
        <h2 className="form-title">{t('loading')}</h2>
        <p className="form-description loading-text">
          {t('ai_analyzing')}
        </p>
      </div>
    );
  }

  // Helper to render priority selection
  const renderPrioritySelection = (title: string, subtitle: string, onNext: () => void, textBtnNext: string, onBack?: () => void) => {
    const subjects = TOPICS.filter(t => t.type === 'interest');
    return (
      <div className="form-container form-container-wide">
        <h2 className="form-title">{title}</h2>
        <p className="form-description">{subtitle}</p>

        <div className="priority-selection-grid">
          {subjects.map(topic => {
            const isSelected = formData.knoppen_input[topic.id]?.weight === 2;
            return (
              <div
                key={topic.id}
                onClick={() => handleWeightToggle(topic.id)}
                className={`priority-card ${isSelected ? 'selected' : ''}`}
              >
                <div>{topic.label}</div>
                {isSelected && (
                  <span className="priority-badge">
                    2x
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="nav-buttons-container">
          {onBack && <button className="btn btn-secondary w-full btn-margin-right" onClick={onBack}>← {t('previous')}</button>}
          <button className="btn btn-primary w-full" onClick={onNext}>
            {textBtnNext}
          </button>
        </div>
      </div>
    );
  };

  // Step 1: Priority Selection (Subjects)
  if (step === 1) {
    return renderPrioritySelection(
      t('Intake Vragenlijst'),
      t('Vul deze vragenlijst in zodat wij je beter kunnen helpen.'),
      () => setStep(2),
      t('next') + " →"
    );
  }

  // Step 2: Questions Loop
  if (step === 2) {
    const topic = TOPICS[topicIndex];
    const currentScore = (formData.knoppen_input[topic.id] as any)?.score;
    const progressPercentage = ((topicIndex + 1) / TOPICS.length) * 100;
    const isWeighted = formData.knoppen_input[topic.id]?.weight === 2;

    return (
      <div className="container question-container">
        <div className="flex justify-end mb-4 absolute top-4 right-4">
          {/* Language switcher can be sticky or just at start/end, leaving it out here to avoid clutter or putting it absolute */}
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div className="form-container form-container-full">
          <div className="question-header-row">
            <span className="question-counter">{t("Onderwerp")} {topicIndex + 1} {t("van")} {TOPICS.length}</span>
            {isWeighted && (
              <span className="badge badge-weighted">
                {t("Telt 2x mee")}
              </span>
            )}
          </div>

          <h2 className="form-title question-title">{topic.question}</h2>
          <div className="topic-btn-group">
            <button type="button" className={`btn topic-btn btn-topic-choice ${currentScore === -1 ? 'active' : ''}`} onClick={() => handleScoreChange(topic.id, -1)}>{t("Nee")}</button>
            <button type="button" className={`btn topic-btn btn-topic-choice ${currentScore === 0 ? 'active' : ''}`} onClick={() => handleScoreChange(topic.id, 0)}>{t("Neutraal")}</button>
            <button type="button" className={`btn topic-btn btn-topic-choice ${currentScore === 1 ? 'active' : ''}`} onClick={() => handleScoreChange(topic.id, 1)}>{t("Ja")}</button>
          </div>
          <div className="nav-buttons-container">
            <button className="btn btn-secondary" onClick={prevQuestion}>← {t('previous')}</button>
            <button className="btn btn-primary" onClick={nextQuestion}>{t('next')} →</button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Re-confirm Priorities
  if (step === 3) {
    return renderPrioritySelection(
      t("Nog even checken..."),
      t("Wil je nog iets aanpassen aan je belangrijkste vakgebieden voordat we afronden?"),
      () => setStep(4),
      t("Verder naar afronding →"),
      () => {
        setTopicIndex(TOPICS.length - 1);
        setStep(2);
      }
    );
  }

  // Step 4: Final Preferences (Open Question & Metadata)
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
            placeholder={t("Bijvoorbeeld: Ik wil graag iets doen met AI en duurzaamheid...")}
            value={formData.open_antwoord}
            onChange={(e) => handleChange('open_antwoord', e.target.value)}
          />
        </div>
        <div className="nav-buttons-container">
          {submitError && (
            <div style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#fee2e2',
              color: '#991b1b', // Red-800
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
          <button className="btn btn-secondary w-full btn-margin-right" onClick={() => setStep(3)}>← {t('previous')}</button>
          <button className="btn btn-primary w-full" onClick={handleSubmit}>{t('submit')}</button>
        </div>
      </div>
    </div>
  );
};

export default VragenlijstFormulier;