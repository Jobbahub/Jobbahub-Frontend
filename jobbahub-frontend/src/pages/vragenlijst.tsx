import React, { useState } from 'react';
import VragenlijstFormulier from '../components/vragenlijstFormulier';
import VragenlijstResultaten from '../components/vragenlijstResultaten';
import { AIRecommendation, ClusterRecommendation, AIResponse, VragenlijstData } from '../services/apiService';
import { IChoiceModule } from '../types';

const Vragenlijst: React.FC = () => {
  const [showResults, setShowResults] = useState(false);
  const [aiRecs, setAiRecs] = useState<AIRecommendation[]>([]);
  // NIEUW: State voor clusters
  const [clusterRecs, setClusterRecs] = useState<ClusterRecommendation[]>([]);
  const [dbModules, setDbModules] = useState<IChoiceModule[]>([]);
  const [userAnswers, setUserAnswers] = useState<VragenlijstData | null>(null);

  // Callback functie: let op dat we hier nu het hele AI response object gebruiken of opsplitsen
  const handleFormComplete = (aiRecsData: AIRecommendation[], dbModulesData: IChoiceModule[], formData: VragenlijstData, clusterData?: ClusterRecommendation[]) => {
    setAiRecs(aiRecsData);
    // Als cluster data is meegegeven, sla op, anders lege lijst
    setClusterRecs(clusterData || []);
    setDbModules(dbModulesData);
    setUserAnswers(formData);
    setShowResults(true);
  };

  const handleRetry = () => {
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