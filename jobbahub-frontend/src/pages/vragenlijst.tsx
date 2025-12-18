import React, { useState } from 'react';
import VragenlijstFormulier from '../components/vragenlijstFormulier';
import VragenlijstResultaten from '../components/vragenlijstResultaten';
import { AIRecommendation } from '../services/apiService';
import { IChoiceModule } from '../types';

const Vragenlijst: React.FC = () => {
  const [showResults, setShowResults] = useState(false);
  const [aiRecs, setAiRecs] = useState<AIRecommendation[]>([]);
  const [dbModules, setDbModules] = useState<IChoiceModule[]>([]);

  // Callback functie die wordt aangeroepen als het formulier klaar is
  const handleFormComplete = (aiData: AIRecommendation[], moduleData: IChoiceModule[]) => {
    setAiRecs(aiData);
    setDbModules(moduleData);
    setShowResults(true);
  };

  // Callback om te resetten
  const handleRetry = () => {
    setAiRecs([]);
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
          onRetry={handleRetry} 
        />
      )}
    </div>
  );
};

export default Vragenlijst;