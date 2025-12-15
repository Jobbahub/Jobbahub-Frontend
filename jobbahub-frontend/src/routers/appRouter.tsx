import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import MainLayout from '../pages/mainLayout';

// Pagina imports (zorg dat deze bestanden bestaan in src/pages)
import Home from '../pages/home';
import Login from '../pages/loginPage';
import Dashboard from '../pages/dashboard';
import Modules from '../pages/modules';

// Beveiligde Route Component (Functie in PascalCase)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Variabele in camelCase
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          
          {/* Publieke Routes */}
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="modules" element={<Modules />} />
          {/* Beschermde Routes */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* 404 Route */}
          <Route path="*" element={<div className="text-center mt-10">Pagina niet gevonden</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;