import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../themeToggle';

const mockToggleTheme = jest.fn();
let mockTheme = 'light';

jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: mockTheme,
    toggleTheme: mockToggleTheme,
  }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTheme = 'light';
  });

  it('renders toggle button', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it('displays moon icon in light mode', () => {
    mockTheme = 'light';
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('🌙');
  });

  it('displays sun icon in dark mode', () => {
    mockTheme = 'dark';
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('☀️');
  });

  it('calls toggleTheme when clicked', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('has correct title in light mode', () => {
    mockTheme = 'light';
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Switch to dark mode');
  });

  it('has correct title in dark mode', () => {
    mockTheme = 'dark';
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Switch to light mode');
  });

  it('has theme-toggle CSS class', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('theme-toggle');
  });

  it('has accessible aria-label', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Toggle theme');
  });
});
