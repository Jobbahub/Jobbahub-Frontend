import { IChoiceModule } from '../types';

export const apiService = {
  /**
   * Haalt alle keuzemodules op via de proxy.
   * We gebruiken een relatief pad ('/api/...'), zodat de browser
   * het verzoek naar de eigen frontend server stuurt.
   * De Vite Proxy stuurt dit vervolgens door naar de backend.
   */
  getModules: async (): Promise<IChoiceModule[]> => {
    try {
      // GEBRUIK HIER EEN RELATIEF PAD
      const response = await fetch('/api/modules');

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