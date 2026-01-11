import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useLanguage } from '../context/LanguageContext';
import { apiService, AIRecommendation, VragenlijstData } from '../services/apiService';
import { IChoiceModule } from '../types';
import { TOPICS } from '../data/constants';
import ModuleCard from '../components/moduleCard';
import ResultChart, { ChartDataPoint } from '../components/ResultChart';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [aiRecs, setAiRecs] = useState<AIRecommendation[]>([]);
  const [dbModules, setDbModules] = useState<IChoiceModule[]>([]);
  const [userAnswers, setUserAnswers] = useState<VragenlijstData | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (user?.vragenlijst_resultaten) {
        const results = user.vragenlijst_resultaten;
        
        // Load recommendations if they exist
        if (results.aanbevelingen && results.aanbevelingen.length > 0) {
          setAiRecs(results.aanbevelingen.slice(0, 5)); // Top 5
        }
        
        // Load answers if they exist (may not exist for manually added modules)
        if (results.antwoorden) {
          setUserAnswers(results.antwoorden);
        }

        // We need modules to display cards
        try {
          const modules = await apiService.getModules();
          setDbModules(modules);
        } catch (error) {
          console.error("Failed to fetch modules", error);
        }
      }
      setLoading(false);
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const handleViewDetails = (id: string) => {
    navigate(`/modules/${id}`);
  };

  const getExplanation = (originalText: string) => {
    if (language === 'nl') return originalText;
    const prefix = "Match op termen:";
    if (originalText && originalText.startsWith(prefix)) {
      const terms = originalText.substring(prefix.length).trim();
      return `${t('match_on_terms')}: ${terms}`;
    }
    return t('generic_ai_reason');
  };

  // --- Chart Logic Duplication (from VragenlijstResultaten) ---
  const generateGlobalColorMap = (ids: string[]) => {
    const KELLY_COLORS = [
      "#FFB300", "#803E75", "#FF6800", "#A6BDD7", "#C10020",
      "#CEA262", "#817066", "#007D34", "#F6768E", "#00538A",
      "#FF7A5C", "#53377A", "#FF8E00", "#B32851", "#F4C800",
      "#7F180D", "#93AA00", "#593315", "#F13A13", "#232C16",
    ];

    return ids.reduce((acc, id, index) => {
      acc[id] = KELLY_COLORS[index % KELLY_COLORS.length];
      return acc;
    }, {} as Record<string, string>);
  };

  const categories = {
    vakgebieden: ['q_tech', 'q_health', 'q_law', 'q_edu', 'q_econ', 'q_comm', 'q_eng', 'q_sport', 'q_creative', 'q_biz'],
    waarden: ['q_social', 'q_sustain', 'q_intl'],
    doelen: ['q_research', 'q_personal', 'q_broadening']
  };

  const allCategoryIds = [
    ...categories.vakgebieden,
    ...categories.waarden,
    ...categories.doelen
  ];
  const colorMap = generateGlobalColorMap(allCategoryIds);

  const prepareChartData = (ids: string[]): ChartDataPoint[] => {
    if (!userAnswers) return [];
    return ids
      .filter(id => id in userAnswers.knoppen_input)
      .map(id => {
        const topic = TOPICS.find(t => t.id === id);
        return {
          id,
          label: topic ? t(topic.label) : id,
          score: userAnswers.knoppen_input[id].score,
          color: colorMap[id],
          isWeighted: userAnswers.knoppen_input[id].weight === 2
        };
      })
      .sort((a, b) => b.score - a.score);
  };

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  // Check if user has any modules (either from questionnaire or manually added)
  const hasModules = aiRecs.length > 0;
  // Check if user has questionnaire results (for showing charts)
  const hasQuestionnaireResults = userAnswers !== null;

  return (
    <div className="page-wrapper">
      {!hasModules ? (
        // No modules at all - show questionnaire prompt
        <div className="page-wrapper dashboard-wrapper">
          <div className="page-hero">
            <h1 className="page-hero-title">
              {t("Persoonlijk Dashboard")}
            </h1>
          </div>

          <div className="container" style={{ marginTop: '40px' }}>
            <div className="dashboard-welcome-card" style={{ marginBottom: '40px' }}>
              <h2 className="text-2xl font-bold mb-2">
                {t("dashboard_welcome_intro")} <span className="text-blue-600">{user?.name}</span>!
              </h2>
              <div className="mt-4 space-y-4 text-gray-700">
                <p>{t("dashboard_explanation_results")}</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>{t("Jouw Profiel Verdeling")}:</strong> {t("dashboard_graphs_explanation")}</li>
                  <li><strong>{t("Aanbevolen voor jou (Top 5)")}:</strong> {t("dashboard_recs_explanation")}</li>
                </ul>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                  <p className="font-semibold text-blue-800 mb-1">{t("Wat kun je nu doen?")}</p>
                  <p className="text-blue-700 text-sm">{t("dashboard_actions_explanation")}</p>
                </div>
              </div>
            </div>

            <div className="dashboard-welcome-container">
              <h1 className="dashboard-welcome-title">
                {t("dashboard_start_questionnaire_title")}
              </h1>
              <p className="dashboard-welcome-text">
                {t("dashboard_start_questionnaire_subtitle")}
              </p>
              <button
                className="btn-large-primary"
                onClick={() => navigate('/vragenlijst')}
              >
                {t("dashboard_start_button")}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
              <div className="time-estimate">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {t("dashboard_time_estimate")}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Has modules - show dashboard with modules
        <>
          <div className="page-hero">
            <h1 className="page-hero-title">{t("personal_dashboard")}</h1>
          </div>

          <div className="container" style={{ marginTop: '40px' }}>
            <div className="dashboard-welcome-card">
              <h2 className="text-2xl font-bold mb-2">
                {t("dashboard_welcome_intro")} <span className="text-blue-600">{user?.name}</span>!
              </h2>
              <div className="mt-4 space-y-4 text-gray-700">
                <p>{t("dashboard_explanation_results")}</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>{t("Jouw Profiel Verdeling")}:</strong> {t("dashboard_graphs_explanation")}</li>
                  <li><strong>{t("Aanbevolen voor jou (Top 5)")}:</strong> {t("dashboard_recs_explanation")}</li>
                </ul>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                  <p className="font-semibold text-blue-800 mb-1">{t("Wat kun je nu doen?")}</p>
                  <p className="text-blue-700 text-sm">{t("dashboard_actions_explanation")}</p>
                </div>
              </div>
            </div>

            {/* Modules Section */}
            <div className="dashboard-section-wrapper">
              <h2 className="dashboard-section-title">
                {hasQuestionnaireResults ? t("Aanbevolen voor jou (Top 5)") : t("Mijn Modules")}
              </h2>
              <div className="centered-modules-grid">
                {aiRecs.map((rec, index) => {
                  const foundModule = dbModules.find(m => 
                    m.name.toLowerCase().includes(rec.name.toLowerCase()) ||
                    rec.name.toLowerCase().includes(m.name.toLowerCase())
                  );
                  if (!foundModule) return null;

                  return (
                    <ModuleCard
                      key={`dash-rec-${index}`}
                      module={foundModule}
                      onClick={handleViewDetails}
                      matchPercentage={rec.match_percentage > 0 ? rec.match_percentage : undefined}
                      explanation={rec.match_percentage > 0 ? getExplanation(rec.waarom) : undefined}
                      isCluster={false}
                      categoryScores={rec.category_scores}
                      userAnswers={userAnswers}
                      rank={index + 1}
                    />
                  );
                })}
              </div>
            </div>

            {/* Charts - Only show if user has questionnaire results */}
            {hasQuestionnaireResults && (
              <div className="dashboard-section-wrapper">
                <h2 className="dashboard-section-title">
                  {t("Jouw Profiel Verdeling")}
                </h2>
                <div className="dashboard-charts-grid">
                  <div className="chart-container">
                    <ResultChart
                      title={t("Interesses (Vakgebieden)")}
                      data={prepareChartData(categories.vakgebieden)}
                    />
                  </div>
                  <div className="chart-container">
                    <ResultChart
                      title={t("Waarden")}
                      data={prepareChartData(categories.waarden)}
                    />
                  </div>
                  <div className="chart-container">
                    <ResultChart
                      title={t("Doelen")}
                      data={prepareChartData(categories.doelen)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Show prompt to take questionnaire if user only has manual modules */}
            {!hasQuestionnaireResults && (
              <div className="dashboard-section-wrapper">
                <div className="dashboard-questionnaire-prompt">
                  <h3>{t("Wil je gepersonaliseerde aanbevelingen?")}</h3>
                  <p>{t("Vul de vragenlijst in om modules te ontdekken die perfect bij jouw interesses passen.")}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/vragenlijst')}
                  >
                    {t("Start de vragenlijst")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;