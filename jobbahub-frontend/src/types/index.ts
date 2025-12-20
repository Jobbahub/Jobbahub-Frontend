export interface IChoiceModule {
  id: number;
  _id: string;
  name: string;
  description: string;
  studycredit: number;
  shortdescription?: string;
  level?: string;
  start_date?: string;
  location?: string;
  tags_list?: string;   // Hernaamd van module_tags
  main_filter?: string; // Nieuw veld
  learningoutcomes?: string;
  content?: string;
  available_spots?: number;
  estimated_difficulty?: number;
  target_audience?: string;
}

export interface AIRecommendation {
  name: string;
  match_percentage: number;
  waarom: string;
  studycredit: number;
}

export interface ClusterRecommendation {
  name: string;
  popularity_score: number;
  waarom: string;
}