import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from '../LanguageSwitcher';

const mockSetLanguage = jest.fn();
let mockLanguage: 'nl' | 'en' = 'nl';

jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    language: mockLanguage,
    setLanguage: mockSetLanguage,
    t: (key: string) => key,
  }),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLanguage = 'nl';
  });

  it('renders language button', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button', { name: /switch language/i });
    expect(button).toBeInTheDocument();
  });

  it('displays NL when language is Dutch', () => {
    mockLanguage = 'nl';
    render(<LanguageSwitcher />);
    expect(screen.getByText('NL')).toBeInTheDocument();
  });

  it('displays EN when language is English', () => {
    mockLanguage = 'en';
    render(<LanguageSwitcher />);
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('switches from NL to EN when clicked', () => {
    mockLanguage = 'nl';
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockSetLanguage).toHaveBeenCalledWith('en');
  });

  it('switches from EN to NL when clicked', () => {
    mockLanguage = 'en';
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockSetLanguage).toHaveBeenCalledWith('nl');
  });

  it('has correct title in Dutch mode', () => {
    mockLanguage = 'nl';
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Switch to English');
  });

  it('has correct title in English mode', () => {
    mockLanguage = 'en';
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Schakel naar Nederlands');
  });

  it('applies theme-toggle and language-btn classes', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('theme-toggle');
    expect(button).toHaveClass('language-btn');
  });

  it('has accessible aria-label', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch language');
  });
});
