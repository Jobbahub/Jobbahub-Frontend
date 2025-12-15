import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="main-layout">
      <header className="site-header">
        <div className="container header-inner">
          <h1 className="logo">Jobbahub</h1>
          
          <nav className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/modules" className="nav-link">Modules</Link> 
            
            {!user ? (
              <Link to="/login" className="nav-link">Login</Link>
            ) : (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <button onClick={logout} className="btn btn-logout">
                  Uitloggen
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="page-content container">
        <Outlet />
      </main>

      {/* AANGEPAST: Footer inhoud zit nu in een container */}
      <footer className="footer">
        <div className="container footer-inner">
          &copy; {new Date().getFullYear()} Jobbahub
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;