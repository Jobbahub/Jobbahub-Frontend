import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

// Importeer je nieuwe onderdelen
import MainLayout from '../pages/layouts/mainLayout';
import Home from '../pages/home';

// --- Tijdelijke Pagina's (Verplaats deze ook naar src/pages voor een schone structuur!) ---
const Login = () => {
  const { login } = useAuth();
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Inloggen</h2>
      <button onClick={() => login("test@user.com", "123")} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
        Simuleer Login
      </button>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p>Welkom, {user?.name}!</p>
    </div>
  );
};

// Beveiligde Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* De MainLayout wikkelt zich om alle routes hierbinnen */}
        <Route path="/" element={<MainLayout />}>
          
          {/* Publieke Routes */}
          <Route index element={<Home />} /> {/* 'index' betekent: dit is de default voor path="/" */}
          <Route path="login" element={<Login />} />

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