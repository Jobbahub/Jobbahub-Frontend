import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MobileMenu from '../MobileMenu';

jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'nl',
  }),
}));

jest.mock('../ThemeToggle', () => {
  return function MockThemeToggle() {
    return <button data-testid="theme-toggle">Theme</button>;
  };
});

jest.mock('../LanguageSwitcher', () => {
  return function MockLanguageSwitcher() {
    return <button data-testid="language-switcher">Lang</button>;
  };
});

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('MobileMenu', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    user: null,
    onLogout: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('visibility', () => {
    it('has open class when isOpen is true', () => {
      const { container } = renderWithRouter(<MobileMenu {...defaultProps} isOpen={true} />);
      expect(container.querySelector('.mobile-menu')).toHaveClass('open');
    });

    it('does not have open class when isOpen is false', () => {
      const { container } = renderWithRouter(<MobileMenu {...defaultProps} isOpen={false} />);
      expect(container.querySelector('.mobile-menu')).not.toHaveClass('open');
    });

    it('shows backdrop when open', () => {
      const { container } = renderWithRouter(<MobileMenu {...defaultProps} isOpen={true} />);
      expect(container.querySelector('.mobile-menu-backdrop')).toBeInTheDocument();
    });

    it('hides backdrop when closed', () => {
      const { container } = renderWithRouter(<MobileMenu {...defaultProps} isOpen={false} />);
      expect(container.querySelector('.mobile-menu-backdrop')).not.toBeInTheDocument();
    });
  });

  describe('navigation links', () => {
    it('renders modules link', () => {
      renderWithRouter(<MobileMenu {...defaultProps} />);
      expect(screen.getByText('nav_modules')).toBeInTheDocument();
    });

    it('renders help me choose link', () => {
      renderWithRouter(<MobileMenu {...defaultProps} />);
      expect(screen.getByText('nav_help_me_choose')).toBeInTheDocument();
    });

    it('renders favorites link', () => {
      renderWithRouter(<MobileMenu {...defaultProps} />);
      expect(screen.getByText('nav_favorites')).toBeInTheDocument();
    });

    it('renders about link', () => {
      renderWithRouter(<MobileMenu {...defaultProps} />);
      expect(screen.getByText('nav_about')).toBeInTheDocument();
    });

    it('has correct href for modules link', () => {
      renderWithRouter(<MobileMenu {...defaultProps} />);
      const link = screen.getByText('nav_modules').closest('a');
      expect(link).toHaveAttribute('href', '/modules');
    });

    it('calls onClose when a link is clicked', () => {
      const onClose = jest.fn();
      renderWithRouter(<MobileMenu {...defaultProps} onClose={onClose} />);
      
      fireEvent.click(screen.getByText('nav_modules'));
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('backdrop interaction', () => {
    it('calls onClose when backdrop is clicked', () => {
      const onClose = jest.fn();
      const { container } = renderWithRouter(<MobileMenu {...defaultProps} onClose={onClose} />);
      
      const backdrop = container.querySelector('.mobile-menu-backdrop');
      fireEvent.click(backdrop!);
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('unauthenticated state', () => {
    it('shows login link when not logged in', () => {
      renderWithRouter(<MobileMenu {...defaultProps} user={null} />);
      expect(screen.getByText('login')).toBeInTheDocument();
    });

    it('does not show profile link when not logged in', () => {
      renderWithRouter(<MobileMenu {...defaultProps} user={null} />);
      expect(screen.queryByText('nav_profile')).not.toBeInTheDocument();
    });

    it('does not show logout button when not logged in', () => {
      renderWithRouter(<MobileMenu {...defaultProps} user={null} />);
      expect(screen.queryByText('logout')).not.toBeInTheDocument();
    });

    it('login link closes menu when clicked', () => {
      const onClose = jest.fn();
      renderWithRouter(<MobileMenu {...defaultProps} onClose={onClose} user={null} />);
      
      fireEvent.click(screen.getByText('login'));
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('authenticated state', () => {
    it('shows profile link when logged in', () => {
      renderWithRouter(<MobileMenu {...defaultProps} user={mockUser} />);
      expect(screen.getByText('nav_profile')).toBeInTheDocument();
    });

    it('shows logout button when logged in', () => {
      renderWithRouter(<MobileMenu {...defaultProps} user={mockUser} />);
      expect(screen.getByText('logout')).toBeInTheDocument();
    });

    it('does not show login link when logged in', () => {
      renderWithRouter(<MobileMenu {...defaultProps} user={mockUser} />);
      expect(screen.queryByText('login')).not.toBeInTheDocument();
    });

    it('calls onLogout when logout button clicked', () => {
      const onLogout = jest.fn();
      renderWithRouter(<MobileMenu {...defaultProps} user={mockUser} onLogout={onLogout} />);
      
      fireEvent.click(screen.getByText('logout'));
      
      expect(onLogout).toHaveBeenCalled();
    });

    it('calls onClose when logout button clicked', () => {
      const onClose = jest.fn();
      renderWithRouter(<MobileMenu {...defaultProps} user={mockUser} onClose={onClose} />);
      
      fireEvent.click(screen.getByText('logout'));
      
      expect(onClose).toHaveBeenCalled();
    });

    it('profile link has correct href', () => {
      renderWithRouter(<MobileMenu {...defaultProps} user={mockUser} />);
      const link = screen.getByText('nav_profile').closest('a');
      expect(link).toHaveAttribute('href', '/profile');
    });
  });

  describe('footer controls', () => {
    it('renders ThemeToggle', () => {
      renderWithRouter(<MobileMenu {...defaultProps} />);
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('renders LanguageSwitcher', () => {
      renderWithRouter(<MobileMenu {...defaultProps} />);
      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('uses nav element', () => {
      const { container } = renderWithRouter(<MobileMenu {...defaultProps} />);
      expect(container.querySelector('nav.mobile-menu')).toBeInTheDocument();
    });
  });
});
