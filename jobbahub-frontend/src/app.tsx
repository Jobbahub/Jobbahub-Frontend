import React from 'react';
import { AuthProvider } from './context/authContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRouter from './routers/appRouter';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;