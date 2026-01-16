import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VragenlijstFormulier from '../vragenlijstFormulier';

jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'nl',
  }),
}));

jest.mock('../../data/constants', () => ({
  TOPICS: [
    { id: 'q_tech', label: 'Technology', question: 'Interest in tech?', type: 'interest' },
    { id: 'q_health', label: 'Health', question: 'Interest in health?', type: 'interest' },
  ],
}));

jest.mock('../loadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

const mockGetModules = jest.fn();
const mockVerstuurVragenlijst = jest.fn();

jest.mock('../../services/apiService', () => ({
  apiService: {
    getModules: () => mockGetModules(),
    verstuurVragenlijst: (data: unknown) => mockVerstuurVragenlijst(data),
  },
  ApiError: class ApiError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

describe('VragenlijstFormulier', () => {
  const mockOnComplete = jest.fn();

  const defaultProps = {
    onComplete: mockOnComplete,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetModules.mockResolvedValue([]);
    mockVerstuurVragenlijst.mockResolvedValue({
      aanbevelingen: [],
      cluster_suggesties: [],
    });
  });

  describe('Step 1: Introduction', () => {
    it('renders introduction screen initially', () => {
      render(<VragenlijstFormulier {...defaultProps} />);
      expect(screen.getByText('intro_title')).toBeInTheDocument();
      expect(screen.getByText('intro_subtitle')).toBeInTheDocument();
    });

    it('renders start button', () => {
      render(<VragenlijstFormulier {...defaultProps} />);
      expect(screen.getByText(/start_questionnaire/)).toBeInTheDocument();
    });

    it('proceeds to step 2 when start is clicked', () => {
      render(<VragenlijstFormulier {...defaultProps} />);
      fireEvent.click(screen.getByText(/start_questionnaire/));
      expect(screen.getByText(/Onderwerp 1/)).toBeInTheDocument();
    });
  });

  describe('Step 2: Questions Loop', () => {
    beforeEach(() => {
      render(<VragenlijstFormulier {...defaultProps} />);
      fireEvent.click(screen.getByText(/start_questionnaire/));
    });

    it('displays question info', () => {
      expect(screen.getByText(/Onderwerp 1/)).toBeInTheDocument();
      expect(screen.getByText('Interest in tech?')).toBeInTheDocument();
    });

    it('renders answer buttons', () => {
      expect(screen.getByText('Nee')).toBeInTheDocument();
      expect(screen.getByText('Neutraal')).toBeInTheDocument();
      expect(screen.getByText('Ja')).toBeInTheDocument();
    });

    it('navigates to next question', () => {
      fireEvent.click(screen.getByText('Ja')); // Select answer
      fireEvent.click(screen.getByText(/next/)); // Click next
      expect(screen.getByText(/Onderwerp 2/)).toBeInTheDocument();
      expect(screen.getByText('Interest in health?')).toBeInTheDocument();
    });

    it('shows visual timeline', () => {
      expect(document.querySelector('.timeline-container')).toBeInTheDocument();
    });
  });

  describe('Step 3: Final Preferences', () => {
    const goToStep3 = () => {
      render(<VragenlijstFormulier {...defaultProps} />);
      fireEvent.click(screen.getByText(/start_questionnaire/)); // Step 1 -> 2

      // Question 1
      fireEvent.click(screen.getByText('Ja'));
      fireEvent.click(screen.getByText(/next/));

      // Question 2 (Last one in mock)
      fireEvent.click(screen.getByText('Neutraal'));
      fireEvent.click(screen.getByText(/next/));
    };

    it('shows preferences form', () => {
      goToStep3();
      expect(screen.getByText('Persoonlijke Gegevens')).toBeInTheDocument();
    });

    it('renders form inputs', () => {
      goToStep3();
      expect(screen.getByText('Taal')).toBeInTheDocument();
      expect(screen.getByText('Locatie')).toBeInTheDocument();
      expect(screen.getByText('Studiepunten')).toBeInTheDocument();
    });

    it('submits form successfully', async () => {
      goToStep3();

      const submitBtn = screen.getByText('submit');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockVerstuurVragenlijst).toHaveBeenCalled();
      });
    });
  });
});
