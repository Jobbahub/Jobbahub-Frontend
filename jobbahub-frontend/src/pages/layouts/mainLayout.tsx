import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* --- Header / Navigatie --- */}
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">Jobbahub</h1>
          
          <nav className="flex gap-4">
            <Link to="/" className="text-blue-600 hover:underline">Home</Link>
            
            {!user ? (
              <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
            ) : (
              <>
                <Link to="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>
                <button 
                  onClick={logout} 
                  className="text-red-500 hover:text-red-700 font-semibold ml-4"
                >
                  Uitloggen
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* --- Pagina Inhoud --- */}
      <main className="flex-grow container mx-auto p-4">
        {/* Hier wordt de inhoud van Home, Login of Dashboard geladen */}
        <Outlet />
      </main>

      {/* --- Footer (Optioneel) --- */}
      <footer className="bg-gray-200 p-4 text-center text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Jobbahub
      </footer>
    </div>
  );
};

export default MainLayout;