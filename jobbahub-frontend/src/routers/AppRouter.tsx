import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- Tijdelijke Pagina Componenten (vervang deze later door echte files in src/pages) ---

const Home = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-primary mb-4">Welkom bij Jobbahub</h1>
    <p>Dit is de homepagina.</p>
    <nav className="mt-4 gap-4 flex text-blue-600 underline">
      <LinkDN to="/login">Login</LinkDN>
      <LinkDN to="/dashboard">Dashboard (Prive)</LinkDN>
    </nav>
  </div>
);

const Login = () => {
  const { login } = useAuth();
  const handleLogin = () => login("test@jobbahub.nl", "wachtwoord123");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Inloggen</h1>
      <button 
        onClick={handleLogin} 
        className="bg-primary text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        Simuleer Inloggen
      </button>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welkom terug, {user?.name}!</p>
      <button 
        onClick={logout} 
        className="mt-4 bg-secondary text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        Uitloggen
      </button>
    </div>
  );
};

// Helper component voor links (om TypeScript errors in dit voorbeeld te voorkomen)
const LinkDN: React.FC<{to: string, children: React.ReactNode}> = ({to, children}) => <Link to={to}>{children}</Link>;

// --- Einde Tijdelijke Componenten ---


// Component om routes te beschermen
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Publieke Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Beschermde Routes (alleen toegankelijk als je ingelogd bent) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback voor onbekende routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;