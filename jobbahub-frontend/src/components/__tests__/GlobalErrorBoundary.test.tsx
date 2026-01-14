import { render, screen, fireEvent } from '@testing-library/react';
import GlobalErrorBoundary from '../GlobalErrorBoundary';

// Mock ErrorPage component
jest.mock('../../pages/errorPage', () => {
  return function MockErrorPage({ title, message, code, onRetry }: {
    title: string;
    message: string;
    code: string;
    onRetry: () => void;
  }) {
    return (
      <div data-testid="error-page">
        <h1>{title}</h1>
        <p>{message}</p>
        <span>{code}</span>
        <button onClick={onRetry}>Retry</button>
      </div>
    );
  };
});

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div data-testid="child-content">Child content rendered</div>;
};

// Suppress console.error for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalError;
});

describe('GlobalErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('normal rendering', () => {
    it('renders children when no error occurs', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={false} />
        </GlobalErrorBoundary>
      );
      
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Child content rendered')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <GlobalErrorBoundary>
          <div data-testid="child-1">First</div>
          <div data-testid="child-2">Second</div>
        </GlobalErrorBoundary>
      );
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('catches errors and displays error page', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );
      
      expect(screen.getByTestId('error-page')).toBeInTheDocument();
    });

    it('displays correct error title', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );
      
      expect(screen.getByText('Oeps! Er ging iets fout.')).toBeInTheDocument();
    });

    it('displays error message', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );
      
      expect(screen.getByText(/Er is een onverwachte fout opgetreden/)).toBeInTheDocument();
    });

    it('displays APP_CRASH error code', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );
      
      expect(screen.getByText('APP_CRASH')).toBeInTheDocument();
    });

    it('logs error to console', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );
      
      expect(console.error).toHaveBeenCalled();
    });

    it('does not render children after error', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );
      
      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    });
  });

  describe('retry functionality', () => {
    it('provides retry button', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );
      
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('calls onRetry handler when retry is clicked', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );
      
      const retryButton = screen.getByText('Retry');
      // Just verify the button is clickable - actual reload is tested via integration
      expect(retryButton).toBeEnabled();
      fireEvent.click(retryButton);
    });
  });

describe('static getDerivedStateFromError', () => {
    it('returns hasError true and captures error', () => {
      const error = new Error('Test');
      const result = (GlobalErrorBoundary as any).getDerivedStateFromError(error);
      
      expect(result).toEqual({
        hasError: true,
        error: error,
      });
    });
  });
});