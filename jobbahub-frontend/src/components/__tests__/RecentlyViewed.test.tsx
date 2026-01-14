import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecentlyViewed from '../RecentlyViewed';

// Mock dependencies
jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'nl',
  }),
}));

jest.mock('../LoadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

let mockRecentlyViewedIds: string[] = [];
jest.mock('../../hooks/useRecentlyViewed', () => ({
  __esModule: true,
  default: () => ({
    recentlyViewedIds: mockRecentlyViewedIds,
  }),
}));

const mockModules = [
  { id: 1, _id: 'm1', name: 'Module One', studycredit: 15, location: 'Breda' },
  { id: 2, _id: 'm2', name: 'Module Two', studycredit: 30, location: 'Den Bosch' },
  { id: 3, _id: 'm3', name: 'Module Three', studycredit: 15, location: null },
];

jest.mock('../../services/apiService', () => ({
  apiService: {
    getModules: jest.fn(() => Promise.resolve(mockModules)),
  },
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('RecentlyViewed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRecentlyViewedIds = [];
  });

  describe('empty state', () => {
    it('renders nothing when no recently viewed modules', async () => {
      mockRecentlyViewedIds = [];
      const { container } = renderWithRouter(<RecentlyViewed />);
      
      await waitFor(() => {
        expect(container.querySelector('.recently-viewed-section')).not.toBeInTheDocument();
      });
    });
  });

  describe('loading state', () => {
    it('shows loading spinner while fetching', () => {
      mockRecentlyViewedIds = ['1', '2'];
      renderWithRouter(<RecentlyViewed />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('with recently viewed modules', () => {
    beforeEach(() => {
      mockRecentlyViewedIds = ['1', '2'];
    });

    it('renders section title', async () => {
      renderWithRouter(<RecentlyViewed />);
      
      await waitFor(() => {
        expect(screen.getByText('Laatst bekeken')).toBeInTheDocument();
      });
    });

    it('renders recently viewed modules', async () => {
      renderWithRouter(<RecentlyViewed />);
      
      await waitFor(() => {
        expect(screen.getByText('Module One')).toBeInTheDocument();
        expect(screen.getByText('Module Two')).toBeInTheDocument();
      });
    });

    it('shows study credits for each module', async () => {
      renderWithRouter(<RecentlyViewed />);
      
      await waitFor(() => {
        expect(screen.getByText('15 EC')).toBeInTheDocument();
        expect(screen.getByText('30 EC')).toBeInTheDocument();
      });
    });

    it('shows location when available', async () => {
      renderWithRouter(<RecentlyViewed />);
      
      await waitFor(() => {
        expect(screen.getByText('Breda')).toBeInTheDocument();
        expect(screen.getByText('Den Bosch')).toBeInTheDocument();
      });
    });

    it('navigates to module detail when clicked', async () => {
      renderWithRouter(<RecentlyViewed />);
      
      await waitFor(() => {
        expect(screen.getByText('Module One')).toBeInTheDocument();
      });
      
      const card = screen.getByText('Module One').closest('.recently-viewed-card');
      fireEvent.click(card!);
      
      expect(mockNavigate).toHaveBeenCalledWith('/modules/1');
    });
  });

  describe('excludeModuleId prop', () => {
    it('excludes specified module from list', async () => {
      mockRecentlyViewedIds = ['1', '2', '3'];
      renderWithRouter(<RecentlyViewed excludeModuleId="1" />);
      
      await waitFor(() => {
        expect(screen.queryByText('Module One')).not.toBeInTheDocument();
        expect(screen.getByText('Module Two')).toBeInTheDocument();
        expect(screen.getByText('Module Three')).toBeInTheDocument();
      });
    });
  });

  describe('limit behavior', () => {
    it('limits to 5 modules maximum', async () => {
      mockRecentlyViewedIds = ['1', '2', '3', '1', '2', '3'];
      renderWithRouter(<RecentlyViewed />);
      
      await waitFor(() => {
        const cards = document.querySelectorAll('.recently-viewed-card');
        expect(cards.length).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('maintains order', () => {
    it('displays modules in the order they were viewed', async () => {
      mockRecentlyViewedIds = ['2', '1'];
      renderWithRouter(<RecentlyViewed />);
      
      await waitFor(() => {
        const cards = document.querySelectorAll('.recently-viewed-card');
        expect(cards[0]).toHaveTextContent('Module Two');
        expect(cards[1]).toHaveTextContent('Module One');
      });
    });
  });
});
