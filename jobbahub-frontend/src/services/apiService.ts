import { IChoiceModule } from '../types';

const API_URL = import.meta.env.VITE_BACKEND_URI;

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    vragenlijst_resultaten?: any;
  };
}

export interface VragenlijstData {
  keuze_taal: string | null;
  keuze_locatie: string | null;
  keuze_punten: number | null;
  open_antwoord: string;
  knoppen_input: {
    [key: string]: {
      score: number;
      weight: number;
    };
  };
}

export interface AIRecommendation {
  name: string;
  match_percentage: number;
  waarom: string;
  studycredit: number;
}

// NIEUW: Type voor cluster suggesties
export interface ClusterRecommendation {
  name: string;
  popularity_score: number;
  waarom: string;
}

export interface AIResponse {
  aanbevelingen: AIRecommendation[];
  cluster_suggesties: ClusterRecommendation[]; // AANGEPAST
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const apiService = {
  getModules: async (): Promise<IChoiceModule[]> => {
    const response = await fetch(`${API_URL}/api/modules`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  getModuleById: async (id: string): Promise<IChoiceModule> => {
    const response = await fetch(`${API_URL}/api/modules/${id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  },

  login: async (email: string, wachtwoord: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, wachtwoord }),
    });

    if (!response.ok) {
      let errorMessage = 'Inloggen mislukt';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch { }
      throw new Error(errorMessage);
    }
    return await response.json();
  },

  getFavorites: async (): Promise<string[]> => {
    const response = await fetch(`${API_URL}/api/favorites`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.map((fav: any) => fav.module_id);
  },

  addFavorite: async (moduleId: string) => {
    const response = await fetch(`${API_URL}/api/favorites`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ module_id: moduleId })
    });
    if (!response.ok) throw new Error('Kon favoriet niet toevoegen');
  },

  removeFavorite: async (moduleId: string) => {
    const response = await fetch(`${API_URL}/api/favorites/${moduleId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Kon favoriet niet verwijderen');
  },

  verstuurVragenlijst: async (data: VragenlijstData): Promise<AIResponse> => {
    console.log("Versturen naar AI:", JSON.stringify(data, null, 2));

    const response = await fetch(`${API_URL}/api/ai/recommend`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Kon geen aanbevelingen ophalen van de server.');
    }

    return await response.json();
  },

  saveQuestionnaireResults: async (data: any) => {
    const response = await fetch(`${API_URL}/api/auth/questionnaire`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Kon vragenlijst resultaten niet opslaan');
    return await response.json();
  },

  deleteQuestionnaireResults: async () => {
    const response = await fetch(`${API_URL}/api/auth/questionnaire`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Kon vragenlijst resultaten niet resetten');
    return await response.json();
  },

  getMe: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Kon gebruikersgegevens niet ophalen');
    return await response.json();
  }
};