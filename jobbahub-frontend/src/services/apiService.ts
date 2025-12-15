import { IChoiceModule } from '../types';

// Haal de URL op uit de omgevingsvariabelen (.env lokaal, of Azure App Settings in productie)
const API_URL = import.meta.env.VITE_BACKEND_URI;

export const apiService = {
  /**
   * Haalt alle keuzemodules op van de backend.
   */
  getModules: async (): Promise<IChoiceModule[]> => {
    try {
      // We gebruiken nu weer de absolute URL uit de environment variable.
      // Dit is nodig als je frontend en backend op verschillende domeinen draaien (zoals in Azure).
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