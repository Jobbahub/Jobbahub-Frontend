import { IChoiceModule } from '../types';

const API_URL = import.meta.env.VITE_BACKEND_URI;

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Hulpfunctie voor headers met token
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

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/api/auth/login`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errorMessage = 'Inloggen mislukt';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }
    return await response.json();
  },

  // --- Nieuwe functies voor favorieten ---

  getFavorites: async (): Promise<string[]> => {
    const response = await fetch(`${API_URL}/api/favorites`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return []; // Bij fout (bv niet ingelogd) lege lijst teruggeven
    const data = await response.json();
    // De backend stuurt waarschijnlijk objecten, wij willen alleen de module ID's
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
  }
};