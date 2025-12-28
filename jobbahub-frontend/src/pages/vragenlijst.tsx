import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import VragenlijstFormulier from '../components/vragenlijstFormulier';
import VragenlijstResultaten from '../components/vragenlijstResultaten';
import { AIRecommendation, ClusterRecommendation, VragenlijstData, apiService, ApiError } from '../services/apiService';
import { IChoiceModule } from '../types';
import { useAuth } from '../context/authContext';

const Vragenlijst: React.FC = () => {
  const [showResults, setShowResults] = useState(false);
  const [aiRecs, setAiRecs] = useState<AIRecommendation[]>([]);
  // NIEUW: State voor clusters
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
        // Check if there are actual results saved (sometimes it might be empty object if schema default)
        const results = user.vragenlijst_resultaten;
        if (!results.aanbevelingen || results.aanbevelingen.length === 0) return;

        try {
          setAiRecs(results.aanbevelingen);
          setClusterRecs(results.cluster_suggesties || []);
          setUserAnswers(results.antwoorden || null);

          // We need to fetch modules to show the cards
          const modules = await apiService.getModules();
          setDbModules(modules);
          setShowResults(true);
        } catch (e: any) {
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
  }, [user]);

  // Callback functie: let op dat we hier nu het hele AI response object gebruiken of opsplitsen
  const handleFormComplete = async (aiRecsData: AIRecommendation[], dbModulesData: IChoiceModule[], formData: VragenlijstData, clusterData?: ClusterRecommendation[]) => {
    setAiRecs(aiRecsData);
    // Als cluster data is meegegeven, sla op, anders lege lijst
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
      } catch (e: any) {
        console.error("Failed to save questionnaire results:", e);
        // const errorCode = e instanceof ApiError ? e.status : "SAVE_ERROR";
        // Show inline error instead of redirecting so data is not lost
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
      } catch (e: any) {
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
    <div className="page-content">
      {saveError && (
        <div className="container form-error" style={{ marginBottom: '20px', padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px' }}>
          {saveError}
        </div>
      )}
      {!showResults ? (
        // We moeten de VragenlijstFormulier component ook vertellen dat hij cluster data moet doorgeven. 
        // Zie stap 2b hieronder voor de aanpassing in VragenlijstFormulier.
        <VragenlijstFormulier onComplete={handleFormComplete} />
      ) : (
        <VragenlijstResultaten
          aiRecs={aiRecs}
          clusterRecs={clusterRecs} // NIEUW: Doorgeven
          dbModules={dbModules}
          userAnswers={userAnswers}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
};

export default Vragenlijst;