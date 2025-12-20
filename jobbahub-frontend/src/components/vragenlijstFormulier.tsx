import React, { useState } from 'react';
import { apiService, VragenlijstData, AIRecommendation } from '../services/apiService';
import { IChoiceModule, ClusterRecommendation } from '../types';

export const TOPICS = [
  { id: 'q_tech', label: 'Technologie & IT', question: "Vind je het leuk om te leren hoe technologie de wereld verandert en hoe je IT-oplossingen kunt toepassen?" },
  { id: 'q_health', label: 'Gezondheid & Zorg', question: "Heb je interesse in zorg, welzijn en innovaties die mensen gezonder maken?" },
  { id: 'q_social', label: 'Sociaal & Maatschappij', question: "Ben je betrokken bij maatschappelijke vraagstukken en wil je begrijpen wat mensen beweegt?" },
  { id: 'q_law', label: 'Recht & Regelgeving', question: "Vind je het interessant om te duiken in regels, wetten en rechtvaardigheid?" },
  { id: 'q_edu', label: 'Onderwijs', question: "Lijkt het je wat om anderen iets te leren, te coachen of te begeleiden in hun ontwikkeling?" },
  { id: 'q_econ', label: 'Economie & Financiën', question: "Ben je nieuwsgierig naar hoe markten werken, geldstromen lopen en financiële beslissingen worden gemaakt?" },
  { id: 'q_comm', label: 'Communicatie & Media', question: "Houd je van storytelling, media-strategieën en het overbrengen van boodschappen?" },
  { id: 'q_eng', label: 'Engineering & Techniek', question: "Wil je weten hoe dingen werken en tastbare technische oplossingen ontwerpen?" },
  { id: 'q_sport', label: 'Sport & Beweging', question: "Vind je sport, vitaliteit en beweging belangrijke thema's?" },
  { id: 'q_sustain', label: 'Duurzaamheid & Milieu', question: "Wil je bijdragen aan een groenere wereld en oplossingen bedenken voor klimaatproblemen?" },
  { id: 'q_creative', label: 'Creativiteit & Design', question: "Houd je ervan om creatieve concepten te bedenken, te ontwerpen en 'out of the box' te denken?" },
  { id: 'q_intl', label: 'Internationaal', question: "Ben je geïnteresseerd in andere culturen, talen en internationale samenwerking?" },
  { id: 'q_biz', label: 'Business & Ondernemen', question: "Zie je jezelf later een eigen bedrijf starten of een organisatie managen?" },
  { id: 'q_research', label: 'Onderzoek & Wetenschap', question: "Vind je het leuk om dingen tot op de bodem uit te zoeken en feiten te analyseren?" },
  { id: 'q_personal', label: 'Persoonlijke Ontwikkeling', question: "Wil je specifiek werken aan je eigen leiderschap, skills en persoonlijke groei?" },
  { id: 'q_broadening', label: 'Algemene Verbreding', question: "Sta je open voor algemene onderwerpen die je blik verruimen buiten je eigen vakgebied?" },
];

interface VragenlijstFormulierProps {
  onComplete: (
    aiRecs: AIRecommendation[], 
    dbModules: IChoiceModule[], 
    formData: VragenlijstData,
    clusterRecs?: ClusterRecommendation[]
  ) => void;
}

const VragenlijstFormulier: React.FC<VragenlijstFormulierProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [topicIndex, setTopicIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<VragenlijstData>({
    keuze_taal: null,
    keuze_locatie: null,
    keuze_punten: null,
    open_antwoord: '',
    knoppen_input: TOPICS.reduce((acc, topic) => ({
      ...acc,
      [topic.id]: { score: 1, weight: 1 }
    }), {})
  });

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
    } catch (error) {
      console.error(error);
      alert("Er ging iets mis bij het ophalen van aanbevelingen. Probeer het later opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container loading-container">
        <div className="loading-spinner"></div>
        <h2 className="form-title">Even geduld...</h2>
        <p className="form-description loading-text">
          De AI is jouw antwoorden aan het analyseren om de beste matches te vinden.
        </p>
      </div>
    );
  }

  // Render Stap 1 (Voorkeuren)
  if (step === 1) {
    return (
      <div className="form-container form-container-wide">
        <h2 className="form-title">Stap 1: Jouw Voorkeuren</h2>
        <p className="form-description">Maak een keuze of kies 'Geen voorkeur'.</p>
        <div className="login-form">
          <div className="form-group">
            <label className="form-label">Voertaal</label>
            <select
              className="form-input"
              value={formData.keuze_taal || ""}
              onChange={(e) => handleChange('keuze_taal', e.target.value === "" ? null : e.target.value)}
            >
              <option value="">Geen voorkeur</option>
              <option value="Nederlands">Nederlands</option>
              <option value="Engels">Engels</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Locatie</label>
            <select
              className="form-input"
              value={formData.keuze_locatie || ""}
              onChange={(e) => handleChange('keuze_locatie', e.target.value === "" ? null : e.target.value)}
            >
              <option value="">Geen voorkeur</option>
              <option value="Den Bosch">Den Bosch</option>
              <option value="Breda">Breda</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Aantal Studiepunten</label>
            <select
              className="form-input"
              value={formData.keuze_punten || ""}
              onChange={(e) => handleChange('keuze_punten', e.target.value === "" ? null : parseInt(e.target.value))}
            >
              <option value="">Geen voorkeur</option>
              <option value={15}>15 EC</option>
              <option value={30}>30 EC</option>
            </select>
          </div>
          <button className="btn btn-primary w-full" onClick={() => setStep(2)}>
            Volgende Stap →
          </button>
        </div>
      </div>
    );
  }

  // Render Stap 2 (Vragen)
  if (step === 2) {
    const topic = TOPICS[topicIndex];
    const currentScore = (formData.knoppen_input[topic.id] as any)?.score;
    const progressPercentage = ((topicIndex + 1) / TOPICS.length) * 100;

    return (
      <div className="container question-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div className="form-container" style={{ margin: '0 auto', maxWidth: '100%' }}>
          <span className="question-counter">Onderwerp {topicIndex + 1} van {TOPICS.length}</span>
          <h2 className="form-title question-title">{topic.question}</h2>
          <div className="topic-btn-group">
            <button type="button" className={`btn topic-btn btn-topic-choice ${currentScore === 0 ? 'active' : ''}`} onClick={() => handleScoreChange(topic.id, 0)}>Nee</button>
            <button type="button" className={`btn topic-btn btn-topic-choice ${currentScore === 1 ? 'active' : ''}`} onClick={() => handleScoreChange(topic.id, 1)}>Neutraal</button>
            <button type="button" className={`btn topic-btn btn-topic-choice ${currentScore === 2 ? 'active' : ''}`} onClick={() => handleScoreChange(topic.id, 2)}>Ja</button>
          </div>
          <div className="nav-buttons-container">
            <button className="btn btn-secondary" onClick={prevQuestion}>← Vorige</button>
            <button className="btn btn-primary" onClick={nextQuestion}>Volgende →</button>
          </div>
        </div>
      </div>
    );
  }

  // Render Stap 3 (Open vraag)
  return (
    <div className="form-container form-container-wide">
      <h2 className="form-title">Stap 3: Heb je nog specifieke wensen?</h2>
      <p className="form-description">Vertel ons in je eigen woorden wat je zoekt.</p>
      <div className="login-form">
        <div className="form-group">
          <label className="form-label">Jouw gedachten (Optioneel)</label>
          <textarea
            className="form-input"
            rows={6}
            placeholder="Bijvoorbeeld: Ik wil graag iets doen met AI en duurzaamheid..."
            value={formData.open_antwoord}
            onChange={(e) => handleChange('open_antwoord', e.target.value)}
          />
        </div>
        <div className="nav-buttons-container">
          <button className="btn btn-secondary w-full btn-margin-right" onClick={() => setStep(2)}>← Terug</button>
          <button className="btn btn-primary w-full" onClick={handleSubmit}>Bekijk Mijn Matches</button>
        </div>
      </div>
    </div>
  );
};

export default VragenlijstFormulier;