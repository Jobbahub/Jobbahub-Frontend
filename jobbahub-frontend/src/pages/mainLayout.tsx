import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="main-layout">
      <header className="site-header">
        <div className="container header-inner header-grid">
          {/* Left Navigation */}
          <nav className="nav-links nav-group-left">
            <Link to="/modules" className="nav-link">Keuzemodules</Link>
            <Link to="/vragenlijst" className="nav-link">Help Mij Kiezen</Link>
            <Link to="/favorites" className="nav-link">Favorieten</Link>
          </nav>

          {/* Center Logo */}
          <Link to="/" className="logo-container">
            <h1 className="logo">Jobbahub</h1>
          </Link>
          
          {/* Right Navigation */}
          <nav className="nav-links nav-group-right">
            <Link to="/about" className="nav-link">About</Link>
            {!user ? (
              <>
                <Link to="/login" className="nav-link">Login</Link>
              </>
            ) : (
              <>
                <button onClick={logout} className="btn btn-logout">
                  Uitloggen
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="page-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          &copy; {new Date().getFullYear()} Jobbahub
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;