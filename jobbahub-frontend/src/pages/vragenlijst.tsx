import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import VragenlijstFormulier from '../components/vragenlijstFormulier';
import VragenlijstResultaten from '../components/vragenlijstResultaten';
import { apiService, ApiError } from '../services/apiService';
import type { AIRecommendation, ClusterRecommendation, VragenlijstData } from '../types/questionnaire';
import { IChoiceModule } from '../types';
import { useAuth } from '../context/authContext';

const Vragenlijst: React.FC = () => {
  const [showResults, setShowResults] = useState(false);
  const [aiRecs, setAiRecs] = useState<AIRecommendation[]>([]);
  const [clusterRecs, setClusterRecs] = useState<ClusterRecommendation[]>([]);
  const [dbModules, setDbModules] = useState<IChoiceModule[]>([]);
  const [userAnswers, setUserAnswers] = useState<VragenlijstData | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { user, updateUser } = useAuth();

  useEffect(() => {
    const loadSavedResults = async () => {
      if (user?.vragenlijst_resultaten && !showResults) {
        const results = user.vragenlijst_resultaten;
        if (!results.aanbevelingen || results.aanbevelingen.length === 0) return;

        try {
          setAiRecs(results.aanbevelingen);
          setClusterRecs(results.cluster_suggesties || []);
          setUserAnswers(results.antwoorden || null);

          const modules = await apiService.getModules();
          setDbModules(modules);
          setShowResults(true);
        } catch (e: unknown) {
          console.error("Error loading saved questionnaire results:", e);
          const errorCode = e instanceof ApiError ? e.status : "LOAD_ERROR";
          navigate('/error', {
            state: {
              title: "Kon resultaten niet laden",
              message: "Er ging iets mis bij het ophalen van je opgeslagen resultaten. Probeer het later opnieuw.",
              code: errorCode,
              from: location.pathname
            }
          });
        }
      }
    };
    loadSavedResults();
  }, [user, showResults, navigate, location.pathname]);

  const handleFormComplete = async (
    aiRecsData: AIRecommendation[],
    dbModulesData: IChoiceModule[],
    formData: VragenlijstData,
    clusterData?: ClusterRecommendation[]
  ) => {
    setAiRecs(aiRecsData);
    setClusterRecs(clusterData || []);
    setDbModules(dbModulesData);
    setUserAnswers(formData);
    setShowResults(true);

    if (user) {
      try {
        const dataToSave = {
          antwoorden: formData,
          aanbevelingen: aiRecsData,
          cluster_suggesties: clusterData || []
        };
        const updatedStudent = await apiService.saveQuestionnaireResults(dataToSave);
        updateUser({
          ...user,
          vragenlijst_resultaten: updatedStudent.vragenlijst_resultaten
        });
      } catch (e: unknown) {
        console.error("Failed to save questionnaire results:", e);
        setSaveError("Kon resultaten niet opslaan. Je kunt de resultaten wel bekijken, maar ze worden mogelijk niet bewaard in je profiel.");
      }
    }
  };

  const handleRetry = async () => {
    if (user) {
      try {
        await apiService.deleteQuestionnaireResults();
        const updatedUser = { ...user };
        delete updatedUser.vragenlijst_resultaten;
        updateUser(updatedUser);
      } catch (e: unknown) {
        console.error("Failed to reset questionnaire results:", e);
        const errorCode = e instanceof ApiError ? e.status : "RESET_ERROR";
        navigate('/error', {
          state: {
            title: "Resetten mislukt",
            message: "We konden je eerdere resultaten niet verwijderen. Probeer het opnieuw.",
            code: errorCode,
            from: location.pathname
          }
        });
      }
    }
    setAiRecs([]);
    setClusterRecs([]);
    setUserAnswers(null);
    setShowResults(false);
  };

  return (
    <>
      <div className="page-content-inner">
        {saveError && (
          <div className="container form-error" style={{ marginBottom: '20px', padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px' }}>
            {saveError}
          </div>
        )}
        {!showResults ? (
          <VragenlijstFormulier onComplete={handleFormComplete} />
        ) : (
          <VragenlijstResultaten
            aiRecs={aiRecs}
            clusterRecs={clusterRecs}
            dbModules={dbModules}
            userAnswers={userAnswers}
            onRetry={handleRetry}
          />
        )}
      </div>
    </>
  );
};

export default Vragenlijst;
