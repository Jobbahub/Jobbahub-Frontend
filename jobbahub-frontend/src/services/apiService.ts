import { IChoiceModule } from '../types';
import type {
  User,
  VragenlijstData,
  AIResponse,
  AIRecommendation,
  ClusterRecommendation,
  QuestionnaireResults,
  FavoriteItem,
  ChangeCredentialsPayload,
  ChangeCredentialsResponse,
  SaveQuestionnaireResponse,
} from '../types/questionnaire';

// Re-export types for backwards compatibility
export type {
  VragenlijstData,
  AIResponse,
  AIRecommendation,
  ClusterRecommendation,
  QuestionnaireResults,
};

const API_URL = import.meta.env.VITE_BACKEND_URI;

// ✅ SECURITY: Default timeout for all requests (30 seconds)
const DEFAULT_TIMEOUT = 30000;

export interface LoginResponse {
  token: string;
  user: User;
}

// Custom Error class
export class ApiError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ✅ SECURITY: Timeout error class
export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

// ✅ SECURITY: Fetch with timeout wrapper
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError(`Request to ${url} timed out after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// ✅ SECURITY: Generic error messages to prevent information disclosure
const GENERIC_ERROR_MESSAGES: Record<number, string> = {
  400: 'Ongeldige aanvraag',
  401: 'Niet geautoriseerd. Log opnieuw in.',
  403: 'Geen toegang tot deze resource',
  404: 'Resource niet gevonden',
  422: 'Validatiefout',
  429: 'Te veel verzoeken. Probeer later opnieuw.',
  500: 'Server fout. Probeer later opnieuw.',
  502: 'Server is tijdelijk niet bereikbaar',
  503: 'Service niet beschikbaar',
};

const handleResponse = async <T>(
  response: Response,
  defaultMessage: string = 'Er is een fout opgetreden'
): Promise<T> => {
  if (!response.ok) {
    // ✅ SECURITY: Use generic error messages in production
    const isDev = import.meta.env.DEV;
    let errorMessage = GENERIC_ERROR_MESSAGES[response.status] || defaultMessage;

    // Only show detailed errors in development
    if (isDev) {
      try {
        const errorData: { message?: string, error?: string } = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // JSON parsing failed, use generic message
      }
    }

    throw new ApiError(errorMessage, response.status);
  }
  return response.json() as Promise<T>;
};

// ✅ SECURITY: Validate URL to prevent SSRF
const validateApiUrl = (endpoint: string): string => {
  // Ensure endpoint starts with expected path
  if (!endpoint.startsWith('/api/')) {
    throw new Error('Invalid API endpoint');
  }
  return `${API_URL}${endpoint}`;
};

export const apiService = {
  getModules: async (): Promise<IChoiceModule[]> => {
    const url = validateApiUrl('/api/modules');
    const response = await fetchWithTimeout(url);
    return handleResponse<IChoiceModule[]>(response, 'Kon modules niet ophalen');
  },

  getModuleById: async (id: string): Promise<IChoiceModule> => {
    // ✅ SECURITY: Validate ID format (prevent injection)
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      throw new ApiError('Ongeldig module ID', 400);
    }
    const url = validateApiUrl(`/api/modules/${encodeURIComponent(id)}`);
    const response = await fetchWithTimeout(url);
    return handleResponse<IChoiceModule>(response, 'Kon module niet ophalen');
  },

  login: async (email: string, wachtwoord: string): Promise<LoginResponse> => {
    // ✅ SECURITY: Basic input validation
    if (!email || !wachtwoord) {
      throw new ApiError('Email en wachtwoord zijn verplicht', 400);
    }

    const url = validateApiUrl('/api/auth/login');
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, wachtwoord }),
    });
    return handleResponse<LoginResponse>(response, 'Inloggen mislukt');
  },

  getFavorites: async (): Promise<string[]> => {
    const url = validateApiUrl('/api/favorites');
    const response = await fetchWithTimeout(url, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return [];
    const data: (string | FavoriteItem)[] = await response.json();
    if (Array.isArray(data)) {
      return data.map((fav) => typeof fav === 'string' ? fav : fav.module_id);
    }
    return [];
  },

  addFavorite: async (moduleId: string): Promise<void> => {
    // ✅ SECURITY: Validate module ID
    if (!/^[a-zA-Z0-9_-]+$/.test(moduleId)) {
      throw new ApiError('Ongeldig module ID', 400);
    }

    const url = validateApiUrl('/api/favorites');
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ module_id: moduleId })
    });
    if (!response.ok) throw new ApiError('Kon favoriet niet toevoegen', response.status);
  },

  removeFavorite: async (moduleId: string): Promise<void> => {
    // ✅ SECURITY: Validate module ID
    if (!/^[a-zA-Z0-9_-]+$/.test(moduleId)) {
      throw new ApiError('Ongeldig module ID', 400);
    }

    const url = validateApiUrl(`/api/favorites/${encodeURIComponent(moduleId)}`);
    const response = await fetchWithTimeout(url, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new ApiError('Kon favoriet niet verwijderen', response.status);
  },

  verstuurVragenlijst: async (data: VragenlijstData): Promise<AIResponse> => {
    const url = validateApiUrl('/api/ai/recommend');
    // ✅ SECURITY: Longer timeout for AI requests (60 seconds)
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }, 60000);

    return handleResponse<AIResponse>(response, 'Kon geen aanbevelingen ophalen van de server.');
  },

  saveQuestionnaireResults: async (data: QuestionnaireResults): Promise<SaveQuestionnaireResponse> => {
    const url = validateApiUrl('/api/auth/questionnaire');
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<SaveQuestionnaireResponse>(response, 'Kon vragenlijst resultaten niet opslaan');
  },

  deleteQuestionnaireResults: async (): Promise<void> => {
    const url = validateApiUrl('/api/auth/questionnaire');
    const response = await fetchWithTimeout(url, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new ApiError('Kon vragenlijst resultaten niet resetten', response.status);
    }
  },

  getMe: async (): Promise<User> => {
    const url = validateApiUrl('/api/auth/me');
    const response = await fetchWithTimeout(url, {
      headers: getAuthHeaders()
    });
    return handleResponse<User>(response, 'Kon gebruikersgegevens niet ophalen');
  },

  changeCredentials: async (data: ChangeCredentialsPayload): Promise<ChangeCredentialsResponse> => {
    // ✅ SECURITY: Validate required field
    if (!data.currentPassword) {
      throw new ApiError('Huidig wachtwoord is verplicht', 400);
    }

    const url = validateApiUrl('/api/auth/change-credentials');
    const response = await fetchWithTimeout(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse<ChangeCredentialsResponse>(response, 'Wijzigen van gegevens mislukt');
  }
};
