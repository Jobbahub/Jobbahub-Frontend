// src/types/questionnaire.ts
// Shared types for questionnaire data to avoid circular imports

export interface KnoppenInput {
  [key: string]: {
    score: number;
  };
}

export interface VragenlijstData {
  keuze_taal: string | null;
  keuze_locatie: string | null;
  keuze_punten: number | null;
  knoppen_input: KnoppenInput;
}

export interface AIRecommendation {
  name: string;
  match_percentage: number;
  waarom: string;
  studycredit: number;
  category_scores?: Record<string, number>;
}

export interface ClusterRecommendation {
  name: string;
  popularity_score: number;
  waarom: string;
}

export interface AIResponse {
  aanbevelingen: AIRecommendation[];
  cluster_suggesties: ClusterRecommendation[];
}

export interface QuestionnaireResults {
  antwoorden: VragenlijstData;
  aanbevelingen: AIRecommendation[];
  cluster_suggesties: ClusterRecommendation[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  vragenlijst_resultaten?: QuestionnaireResults;
}

// Type for favorite items from API (can be string or object)
export interface FavoriteItem {
  module_id: string;
}

// Type for credential change payload
export interface ChangeCredentialsPayload {
  currentPassword: string;
  newNaam?: string;
  newPassword?: string;
}

// Type for credential change response
export interface ChangeCredentialsResponse {
  user: User;
  message?: string;
}

// Type for save questionnaire response
export interface SaveQuestionnaireResponse {
  vragenlijst_resultaten: QuestionnaireResults;
}
