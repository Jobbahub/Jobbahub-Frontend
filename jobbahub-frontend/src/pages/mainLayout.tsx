import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useLanguage } from '../context/LanguageContext';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher';
import MobileMenu from '../components/MobileMenu';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="main-layout">
      <header className="site-header">
        <div className="container header-inner header-grid">
          {/* Mobile Hamburger Menu Button */}
          <button
            className="hamburger-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {/* Left Navigation */}
          <nav className="nav-links nav-group-left">
            <Link to="/modules" className="nav-link">
              {t("nav_modules")}
            </Link>
            <Link to="/vragenlijst" className="nav-link">
              {t("nav_help_me_choose")}
            </Link>
            <Link to="/favorites" className="nav-link">
              {t("nav_favorites")}
            </Link>
            <Link to="/profile" className="nav-link">
              {t("nav_profile")}
            </Link>
          </nav>

          {/* Center Logo */}
          <Link to="/" className="logo-container">
            <h1 className="logo">Jobbahub</h1>
          </Link>

          {/* Right Navigation */}
          <nav className="nav-links nav-group-right">
            <Link to="/about" className="nav-link">
              {t("nav_about")}
            </Link>
            {!user ? (
              <>
                <Link to="/login" className="nav-link">
                  {t("login")}
                </Link>
              </>
            ) : (
              <>
                <button onClick={logout} className="btn btn-logout">
                  {t("logout")}
                </button>
              </>
            )}
            <ThemeToggle />
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      {/* Mobile Menu Sidebar */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        user={user}
        onLogout={logout}
      />

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
