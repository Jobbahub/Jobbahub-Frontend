import { IChoiceModule } from '../types';

const API_URL = import.meta.env.VITE_BACKEND_URI;

// Nieuwe interfaces voor Auth
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const apiService = {
  /**
   * Haalt alle keuzemodules op.
   */
  getModules: async (): Promise<IChoiceModule[]> => {
    try {
      const response = await fetch(`${API_URL}/api/modules`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Fout bij ophalen modules:", error);
      throw error;
    }
  },
  getModuleById: async (id: string): Promise<IChoiceModule> => {
    try {
      const response = await fetch(`${API_URL}/api/modules/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Fout bij ophalen module ${id}:`, error);
      throw error;
    }
  },
  /**
   * Logt de gebruiker in en ontvangt een token + user data.
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // Let op: controleer of jouw backend endpoint exact '/api/auth/login' is
    const response = await fetch(`${API_URL}/api/auth/login`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      // Probeer de foutmelding van de backend te lezen, anders een standaard melding
      let errorMessage = 'Inloggen mislukt';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Geen json error body
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  }
};