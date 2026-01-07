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

// Custom Error class
export class ApiError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const handleResponse = async (response: Response, defaultMessage: string = 'Er is een fout opgetreden') => {
  if (!response.ok) {
    let errorMessage = defaultMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch { } // Fallback to default message if JSON parsing fails
    throw new ApiError(errorMessage, response.status);
  }
  return response.json();
};

export const apiService = {
  getModules: async (): Promise<IChoiceModule[]> => {
    const response = await fetch(`${API_URL}/api/modules`);
    return handleResponse(response, 'Kon modules niet ophalen');
  },

  getModuleById: async (id: string): Promise<IChoiceModule> => {
    const response = await fetch(`${API_URL}/api/modules/${id}`);
    return handleResponse(response, 'Kon module niet ophalen');
  },

  login: async (email: string, wachtwoord: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, wachtwoord }),
    });
    // Special handling for login could be done here if needed, but handleResponse works too
    return handleResponse(response, 'Inloggen mislukt');
  },

  getFavorites: async (): Promise<string[]> => {
    const response = await fetch(`${API_URL}/api/favorites`, {
      headers: getAuthHeaders()
    });
    // Special case: return empty array on error? Or throw? Code was defaulting to empty array.
    // Let's keep existing logic but standardizing implies throwing. 
    // However, getFavorites returning [] on error was intentional.
    if (!response.ok) return [];
    const data = await response.json();
    if (Array.isArray(data)) {
      // Check of het objecten zijn of strings, en map correct naar IDs
      return data.map((fav: any) => typeof fav === 'string' ? fav : fav.module_id);
    }
    return [];
  },

  addFavorite: async (moduleId: string) => {
    const response = await fetch(`${API_URL}/api/favorites`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ module_id: moduleId })
    });
    if (!response.ok) throw new ApiError('Kon favoriet niet toevoegen', response.status);
  },

  removeFavorite: async (moduleId: string) => {
    const response = await fetch(`${API_URL}/api/favorites/${moduleId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new ApiError('Kon favoriet niet verwijderen', response.status);
  },

  verstuurVragenlijst: async (data: VragenlijstData): Promise<AIResponse> => {
    console.log("Versturen naar AI:", JSON.stringify(data, null, 2));

    const response = await fetch(`${API_URL}/api/ai/recommend`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse(response, 'Kon geen aanbevelingen ophalen van de server.');
  },

  saveQuestionnaireResults: async (data: any) => {
    const response = await fetch(`${API_URL}/api/auth/questionnaire`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response, 'Kon vragenlijst resultaten niet opslaan');
  },

  deleteQuestionnaireResults: async () => {
    const response = await fetch(`${API_URL}/api/auth/questionnaire`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response, 'Kon vragenlijst resultaten niet resetten');
  },

  getMe: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response, 'Kon gebruikersgegevens niet ophalen');
  },

  changeCredentials: async (data: { currentPassword: string; newNaam?: string; newPassword?: string }) => {

    const response = await fetch(`${API_URL}/api/auth/change-credentials`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse(response, 'Wijzigen van gegevens mislukt');
  }
};