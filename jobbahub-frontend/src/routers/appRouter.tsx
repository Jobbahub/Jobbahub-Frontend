import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import MainLayout from '../pages/mainLayout';

// Pagina imports
import Home from '../pages/home';
import Login from '../pages/loginPage';
import Dashboard from '../pages/dashboard';
import Modules from '../pages/modules';
import ModuleDetail from '../pages/moduleDetail';
import About from '../pages/about';
import Favorieten from '../pages/favorieten'; // NEW

// Beveiligde Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Component that shows Home or Dashboard based on auth status
const HomeOrDashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Dashboard />;
  }
  
  return <Home />;
};

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          
          {/* Root route - shows Home when logged out, Dashboard when logged in */}
          <Route index element={<HomeOrDashboard />} />
          
          {/* Publieke Routes */}
          <Route path="login" element={<Login />} />
          <Route path="modules" element={<Modules />} />
          <Route path="modules/:id" element={<ModuleDetail />} />
          <Route path="about" element={<About />} />
          
          {/* Beschermde Routes */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="favorieten"
            element={
              <ProtectedRoute>
                <Favorieten />
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