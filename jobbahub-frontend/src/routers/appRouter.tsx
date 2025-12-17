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

const AppRouter: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Openbare Routes */}
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
            <Route path="modules" element={<ElectiveModules />} />
            <Route path="modules/:id" element={<ModuleDetail />} />
            
            {/* Beveiligde Routes */}
            {/* Alles hierbinnen wordt beschermd door de inline ProtectedRoute */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="favorites" element={<Favorites />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;