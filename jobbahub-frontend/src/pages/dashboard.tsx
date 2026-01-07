import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useLanguage } from '../context/LanguageContext';
import { apiService, AIRecommendation, VragenlijstData } from '../services/apiService';
import { IChoiceModule } from '../types';
import { TOPICS } from '../data/constants';
import ModuleCard from '../components/moduleCard';
import ResultChart, { ChartDataPoint } from '../components/ResultChart';

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
      // 1. Get latest user data to ensure we have results
      // The user object from context might be stale or partial depending on implementation, 
      // but usually strictly updated. We'll trust context or fetch me if needed. 
      // Let's use context user first, but check if we need modules.
      if (user?.vragenlijst_resultaten) {
        const results = user.vragenlijst_resultaten;
        if (results.aanbevelingen && results.aanbevelingen.length > 0) {
          setAiRecs(results.aanbevelingen.slice(0, 5)); // Top 5
          setUserAnswers(results.antwoorden);

          // We need modules to display cards
          try {
            const modules = await apiService.getModules();
            setDbModules(modules);
          } catch (error) {
            console.error("Failed to fetch modules", error);
          }
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
  // Ideally this should be a hook or util

  const generateGlobalColorMap = (ids: string[]) => {
    // Kelly's colors for maximum contrast
    const KELLY_COLORS = [
      "#FFB300", // Vivid Yellow
      "#803E75", // Strong Purple
      "#FF6800", // Vivid Orange
      "#A6BDD7", // Very Light Blue
      "#C10020", // Vivid Red
      "#CEA262", // Grayish Yellow
      "#817066", // Medium Gray
      "#007D34", // Vivid Green
      "#F6768E", // Strong Purplish Pink
      "#00538A", // Strong Blue
      "#FF7A5C", // Strong Yellowish Pink
      "#53377A", // Strong Violet
      "#FF8E00", // Vivid Orange Yellow
      "#B32851", // Strong Purplish Red
      "#F4C800", // Vivid Greenish Yellow
      "#7F180D", // Strong Reddish Brown
      "#93AA00", // Vivid Yellowish Green
      "#593315", // Deep Yellowish Brown
      "#F13A13", // Vivid Reddish Orange
      "#232C16", // Dark Olive Green
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
    return <div className="loading-spinner container" style={{ margin: '50px auto' }}></div>;
  }

  const hasResults = aiRecs.length > 0 && userAnswers;

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <div className="page-hero">
        <h1 className="page-hero-title">{t("personal_dashboard")}</h1>
      </div>

      {/* Main Content */}
      <div className="container" style={{ marginTop: '40px' }}>
        <div className="dashboard-welcome-card">
          <h2 className="text-2xl font-bold mb-2">
            {t("dashboard_welcome_intro")} <span className="text-blue-600">{user?.name}</span>!
          </h2>
          <p className="text-gray-700 mt-2">
            {t("dashboard_intro_loggedin")}
          </p>

          <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4 shadow-sm">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>{t("dashboard_feature_results")}</li>
              <li>{t("dashboard_feature_favorites")}</li>
              <li>{t("dashboard_feature_profile")}</li>
            </ul>
          </div>

          {hasResults ? (
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
          ) : (
            <div className="mt-4">
              <p className="text-gray-600 mb-4">{t("dashboard_no_results_actions")}</p>
              {/* Optional: Add a button here to go to questionnaire directly if desired, but text is enough for now */}
            </div>
          )}
        </div>

        {hasResults && (
          <>
            {/* Top 5 Recommendations */}
            <div className="dashboard-section-wrapper">
              <h2 className="dashboard-section-title">{t("Aanbevolen voor jou (Top 5)")}</h2>
              <div className="centered-modules-grid">
                {aiRecs.map((rec, index) => {
                  const foundModule = dbModules.find(m => m.name.toLowerCase().includes(rec.name.toLowerCase()));
                  if (!foundModule) return null;

                  return (
                    <ModuleCard
                      key={`dash-rec-${index}`}
                      module={foundModule}
                      onClick={handleViewDetails}
                      matchPercentage={rec.match_percentage}
                      explanation={getExplanation(rec.waarom)}
                      isCluster={false}
                    />
                  );
                })}
              </div>
            </div>

            {/* Charts */}
            <div className="dashboard-section-wrapper">
              <h2 className="dashboard-section-title">
                {t("Jouw Profiel Verdeling")}
              </h2>
              <div className="dashboard-charts-grid">
                <ResultChart
                  title={t("Interesses (Vakgebieden)")}
                  data={prepareChartData(categories.vakgebieden)}
                />
                <ResultChart
                  title={t("Waarden")}
                  data={prepareChartData(categories.waarden)}
                />
                <ResultChart
                  title={t("Doelen")}
                  data={prepareChartData(categories.doelen)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;