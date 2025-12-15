 import { IChoiceModule } from '../types';

// Haal de link op uit de .env file
const API_URL = import.meta.env.VITE_BACKEND_URI;

export const apiService = {
  /**
   * Haalt alle keuzemodules op van de backend.
   */
  getModules: async (): Promise<IChoiceModule[]> => {
    if (!API_URL) {
      console.error("VITE_BACKEND_URI is niet ingesteld in .env");
      throw new Error("Backend URL ontbreekt");
    }

    try {
      // We gaan ervan uit dat het endpoint /modules heet achter je base URL
      // Pas dit aan als jouw volledige link al in de .env staat
      const response = await fetch(`${API_URL}/api/keuzemodules`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fout bij ophalen modules:", error);
      throw error;
    }
  }
};