import React, { useState, useEffect } from 'react';
import VragenlijstFormulier from '../components/vragenlijstFormulier';
import VragenlijstResultaten from '../components/vragenlijstResultaten';
import { AIRecommendation, ClusterRecommendation, VragenlijstData, apiService } from '../services/apiService';
import { IChoiceModule } from '../types';
import { useAuth } from '../context/authContext';

const Vragenlijst: React.FC = () => {
  const [showResults, setShowResults] = useState(false);
  const [aiRecs, setAiRecs] = useState<AIRecommendation[]>([]);
  // NIEUW: State voor clusters
  const [clusterRecs, setClusterRecs] = useState<ClusterRecommendation[]>([]);
  const [dbModules, setDbModules] = useState<IChoiceModule[]>([]);
  const [userAnswers, setUserAnswers] = useState<VragenlijstData | null>(null);

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
        } catch (e) {
          console.error("Error loading saved questionnaire results:", e);
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
      } catch (e) {
        console.error("Failed to save questionnaire results:", e);
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
      } catch (e) {
        console.error("Failed to reset questionnaire results:", e);
      }
    }
    setAiRecs([]);
    setClusterRecs([]);
    setUserAnswers(null);
    setShowResults(false);
  };

  return (
    <div className="page-content">
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