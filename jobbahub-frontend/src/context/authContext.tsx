import React, { createContext, useState, useContext, ReactNode } from 'react';
import { apiService } from '../services/apiService';

// Definieer hoe een Gebruiker eruit ziet
interface User {
  id: string;
  name: string;
  email: string;
  vragenlijst_resultaten?: any;
}

// Definieer wat er in de Context beschikbaar is
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (user: User | null) => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Optioneel: Je zou hier een useEffect kunnen toevoegen die bij het opstarten
  // kijkt of er nog een token in localStorage zit om de user te herstellen.

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const data = await apiService.login(email, password);

      // 1. Sla token op (voor latere authenticated requests)
      localStorage.setItem('token', data.token);

      // 2. Zet de gebruiker in de state
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Er is een fout opgetreden bij het inloggen.");
      throw err; // Gooi door zodat de Login pagina dit ook weet
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateUser: setUser, error }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook om de auth context makkelijk te gebruiken in andere componenten
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth moet gebruikt worden binnen een AuthProvider');
  }
  return context;
};