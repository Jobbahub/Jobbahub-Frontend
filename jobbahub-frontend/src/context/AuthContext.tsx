import React, { createContext, useState, useContext, ReactNode } from 'react';

// Definieer hoe een Gebruiker eruit ziet
interface User {
  id: string;
  name: string;
  email: string;
}

// Definieer wat er in de Context beschikbaar is
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Dummy login functie (hier zou je later je API call naar de backend maken)
  const login = async (email: string, password: string) => {
    console.log("Inloggen met:", email, password);
    // Simuleer een API request
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setUser({ id: '1', name: 'Gebruiker', email: email });
        resolve();
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
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