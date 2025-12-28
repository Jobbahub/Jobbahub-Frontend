import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from '../pages/mainLayout';
import Home from '../pages/home';
import About from '../pages/about';
import Login from '../pages/loginPage';
import Dashboard from '../pages/dashboard';
import ElectiveModules from '../pages/modules';
import ModuleDetail from '../pages/moduleDetail';
import Favorites from '../pages/favorites';
import Vragenlijst from '../pages/vragenlijst';
import GlobalErrorBoundary from '../components/GlobalErrorBoundary';
import ErrorPage from '../pages/errorPage';
import { AuthProvider, useAuth } from '../context/authContext';

// --- INLINE PROTECTED ROUTE ---
// Dit componentje checkt of je bent ingelogd. 
// Zo niet? Dan stuurt hij je direct naar /login.
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  // Als wel ingelogd: toon de opgevraagde pagina (Outlet)
  // Als niet ingelogd: navigeer naar login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
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
    <Router>
      <GlobalErrorBoundary>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              {/* Root route - shows Home when logged out, Dashboard when logged in */}
              <Route index element={<HomeOrDashboard />} />

              {/* Openbare Routes */}
              <Route path="about" element={<About />} />
              <Route path="login" element={<Login />} />
              <Route path="modules" element={<ElectiveModules />} />
              <Route path="modules/:id" element={<ModuleDetail />} />

              {/* Error Page Route */}
              <Route path="error" element={<ErrorPage />} />

              {/* Beveiligde Routes */}
              {/* Alles hierbinnen wordt beschermd door de inline ProtectedRoute */}
              <Route element={<ProtectedRoute />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="vragenlijst" element={<Vragenlijst />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<ErrorPage code="404" title="Pagina niet gevonden" message="De pagina die je zoekt bestaat niet." />} />
            </Route>
          </Routes>
        </AuthProvider>
      </GlobalErrorBoundary>
    </Router>
  );
};

export default AppRouter;