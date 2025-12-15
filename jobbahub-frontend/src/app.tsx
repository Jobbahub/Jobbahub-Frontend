// src/App.tsx
import React from 'react';
import { AuthProvider } from './context/authContext';
import AppRouter from './routers/appRouter';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;