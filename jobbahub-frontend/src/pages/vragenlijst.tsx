import React, { useState } from 'react';
import VragenlijstFormulier from '../components/vragenlijstFormulier';
import VragenlijstResultaten from '../components/vragenlijstResultaten';
import { AIRecommendation, VragenlijstData } from '../services/apiService';
import { IChoiceModule } from '../types';

const Vragenlijst: React.FC = () => {
  const [showResults, setShowResults] = useState(false);
  const [aiRecs, setAiRecs] = useState<AIRecommendation[]>([]);
  const [dbModules, setDbModules] = useState<IChoiceModule[]>([]);
  // State voor opgeslagen antwoorden
  const [userAnswers, setUserAnswers] = useState<VragenlijstData | null>(null);

  // Aangepaste callback: ontvangt nu ook formData
  const handleFormComplete = (aiData: AIRecommendation[], moduleData: IChoiceModule[], formData: VragenlijstData) => {
    setAiRecs(aiData);
    setDbModules(moduleData);
    setUserAnswers(formData); // Opslaan in state
    setShowResults(true);
  };

  const handleRetry = () => {
    setAiRecs([]);
    setUserAnswers(null);
    setShowResults(false);
  };

  return (
    <div className="page-content">
      {!showResults ? (
        <VragenlijstFormulier onComplete={handleFormComplete} />
      ) : (
        <VragenlijstResultaten 
          aiRecs={aiRecs} 
          dbModules={dbModules} 
          userAnswers={userAnswers} // Doorgeven aan resultaten
          onRetry={handleRetry} 
        />
      )}
    </div>
  );
};

export default Vragenlijst;