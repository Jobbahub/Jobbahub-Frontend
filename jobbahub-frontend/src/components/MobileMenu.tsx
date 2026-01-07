import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, user, onLogout }) => {
  const { t } = useLanguage();

  const handleLinkClick = () => {
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <>
      {/* Backdrop/Overlay */}
      {isOpen && (
        <div className="mobile-menu-backdrop" onClick={onClose} />
      )}

      {/* Sidebar */}
      <nav className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <button className="mobile-menu-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="mobile-menu-content">
          <Link
            to="/modules"
            className="mobile-menu-link"
            onClick={handleLinkClick}
          >
            {t('nav_modules')}
          </Link>
          <Link
            to="/vragenlijst"
            className="mobile-menu-link"
            onClick={handleLinkClick}
          >
            {t('nav_help_me_choose')}
          </Link>
          <Link
            to="/favorites"
            className="mobile-menu-link"
            onClick={handleLinkClick}
          >
            {t('nav_favorites')}
          </Link>
          <Link
            to="/about"
            className="mobile-menu-link"
            onClick={handleLinkClick}
          >
            {t('nav_about')}
          </Link>

          {!user ? (
            <Link
              to="/login"
              className="mobile-menu-link mobile-menu-login"
              onClick={handleLinkClick}
            >
              {t('login')}
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="mobile-menu-link mobile-menu-logout"
            >
              {t('logout')}
            </button>
          )}

          <div className="mobile-menu-footer">
            <div className="mobile-menu-controls">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default MobileMenu;