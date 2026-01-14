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
    { id: 'q_social', label: 'Social', question: 'Value social impact?', type: 'value' },
  ],
}));

jest.mock('../LoadingSpinner', () => {
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

  describe('Step 1: Priority Selection', () => {
    it('renders priority selection screen initially', () => {
      render(<VragenlijstFormulier {...defaultProps} />);
      expect(screen.getByText('Intake Vragenlijst')).toBeInTheDocument();
    });

    it('renders subject cards for selection', () => {
      render(<VragenlijstFormulier {...defaultProps} />);
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Health')).toBeInTheDocument();
    });

    it('toggles priority when card is clicked', () => {
      render(<VragenlijstFormulier {...defaultProps} />);
      
      const techCard = screen.getByText('Technology').closest('.priority-card');
      fireEvent.click(techCard!);
      
      expect(techCard).toHaveClass('selected');
    });

    it('shows 2x badge when priority is selected', () => {
      render(<VragenlijstFormulier {...defaultProps} />);
      
      const techCard = screen.getByText('Technology').closest('.priority-card');
      fireEvent.click(techCard!);
      
      expect(screen.getByText('2x')).toBeInTheDocument();
    });

    it('proceeds to step 2 when next is clicked', () => {
      render(<VragenlijstFormulier {...defaultProps} />);
      
      const nextButton = screen.getByText(/next/i);
      fireEvent.click(nextButton);
      
      // Should now show question screen
      expect(screen.getByText(/Onderwerp 1/)).toBeInTheDocument();
    });
  });

  describe('Step 2: Questions Loop', () => {
    beforeEach(() => {
      render(<VragenlijstFormulier {...defaultProps} />);
      // Go to step 2
      fireEvent.click(screen.getByText(/next/i));
    });

    it('displays question counter', () => {
      expect(screen.getByText(/Onderwerp 1/)).toBeInTheDocument();
      expect(screen.getByText(/van/)).toBeInTheDocument();
    });

    it('displays question text', () => {
      expect(screen.getByText('Interest in tech?')).toBeInTheDocument();
    });

    it('renders answer buttons', () => {
      expect(screen.getByText('Nee')).toBeInTheDocument();
      expect(screen.getByText('Neutraal')).toBeInTheDocument();
      expect(screen.getByText('Ja')).toBeInTheDocument();
    });

    it('marks selected answer as active', () => {
      const jaButton = screen.getByText('Ja');
      fireEvent.click(jaButton);
      
      expect(jaButton).toHaveClass('active');
    });

    it('advances to next question when next is clicked', () => {
      fireEvent.click(screen.getByText(/next/i));
      
      expect(screen.getByText(/Onderwerp 2/)).toBeInTheDocument();
    });

    it('goes back to previous question when previous is clicked', () => {
      // Go to question 2
      fireEvent.click(screen.getByText(/next/i));
      expect(screen.getByText(/Onderwerp 2/)).toBeInTheDocument();
      
      // Go back
      fireEvent.click(screen.getByText(/previous/i));
      expect(screen.getByText(/Onderwerp 1/)).toBeInTheDocument();
    });

it('shows progress bar', () => {
      render(<VragenlijstFormulier {...defaultProps} />);
      
      // Go to step 2 where progress bar is shown
      fireEvent.click(screen.getAllByText(/next/i)[0]);
      
      // Progress bar should now be visible
      expect(document.querySelector('.progress-bar')).toBeInTheDocument();
    });
  });

  describe('Step 3: Re-confirm Priorities', () => {
    it('shows priority confirmation after all questions', async () => {
      render(<VragenlijstFormulier {...defaultProps} />);
      
      // Go through all steps
      fireEvent.click(screen.getByText(/next/i)); // Step 1 -> 2
      
      // Answer all questions (3 topics in mock)
      fireEvent.click(screen.getByText(/next/i)); // Q1 -> Q2
      fireEvent.click(screen.getByText(/next/i)); // Q2 -> Q3
      fireEvent.click(screen.getByText(/next/i)); // Q3 -> Step 3
      
      expect(screen.getByText('Nog even checken...')).toBeInTheDocument();
    });
  });

  describe('Step 4: Final Preferences', () => {
    const goToStep4 = () => {
      render(<VragenlijstFormulier {...defaultProps} />);
      
      fireEvent.click(screen.getByText(/next/i)); // Step 1 -> 2
      fireEvent.click(screen.getByText(/next/i)); // Q1 -> Q2
      fireEvent.click(screen.getByText(/next/i)); // Q2 -> Q3
      fireEvent.click(screen.getByText(/next/i)); // Q3 -> Step 3
      fireEvent.click(screen.getByText(/Verder naar afronding/i)); // Step 3 -> 4
    };

    it('shows final preferences form', () => {
      goToStep4();
      expect(screen.getByText('Persoonlijke Gegevens')).toBeInTheDocument();
    });

    it('renders language select', () => {
      goToStep4();
      expect(screen.getByText('Taal')).toBeInTheDocument();
      expect(screen.getByText('Nederlands')).toBeInTheDocument();
      expect(screen.getByText('Engels')).toBeInTheDocument();
    });

    it('renders location select', () => {
      goToStep4();
      expect(screen.getByText('Locatie')).toBeInTheDocument();
      expect(screen.getByText('Den Bosch')).toBeInTheDocument();
      expect(screen.getByText('Breda')).toBeInTheDocument();
    });

    it('renders study credits select', () => {
      goToStep4();
      expect(screen.getByText('Studiepunten')).toBeInTheDocument();
      expect(screen.getByText('15 EC')).toBeInTheDocument();
      expect(screen.getByText('30 EC')).toBeInTheDocument();
    });

    it('renders open text area', () => {
      goToStep4();
      expect(screen.getByText(/Jouw gedachten/)).toBeInTheDocument();
    });

    it('shows character count for text area', () => {
      goToStep4();
      expect(screen.getByText('0/1000')).toBeInTheDocument();
    });

    it('updates character count when typing', () => {
      goToStep4();
      
      const textarea = screen.getByPlaceholderText(/Bijvoorbeeld/);
      fireEvent.change(textarea, { target: { value: 'Test text' } });
      
      expect(screen.getByText('9/1000')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('shows loading state during submission', async () => {
      mockVerstuurVragenlijst.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<VragenlijstFormulier {...defaultProps} />);
      
      // Navigate to submit
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/Verder naar afronding/i));
      fireEvent.click(screen.getByText('submit'));
      
      expect(screen.getByText('loading')).toBeInTheDocument();
    });

    it('calls onComplete with results on success', async () => {
      const mockModules = [{ id: 1, name: 'Module 1' }];
      const mockRecommendations = [{ name: 'Rec 1', match_percentage: 90 }];
      
      mockGetModules.mockResolvedValue(mockModules);
      mockVerstuurVragenlijst.mockResolvedValue({
        aanbevelingen: mockRecommendations,
        cluster_suggesties: [],
      });
      
      render(<VragenlijstFormulier {...defaultProps} />);
      
      // Navigate to submit
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/Verder naar afronding/i));
      fireEvent.click(screen.getByText('submit'));
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('shows error message on API failure', async () => {
      mockVerstuurVragenlijst.mockRejectedValue(new Error('API Error'));
      
      render(<VragenlijstFormulier {...defaultProps} />);
      
      // Navigate to submit
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/Verder naar afronding/i));
      fireEvent.click(screen.getByText('submit'));
      
      await waitFor(() => {
        expect(screen.getByText(/ging iets mis/)).toBeInTheDocument();
      });
    });
  });

  describe('Input Validation', () => {
    it('limits text area to 1000 characters', () => {
      render(<VragenlijstFormulier {...defaultProps} />);
      
      // Navigate to final step
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/Verder naar afronding/i));
      
      const textarea = screen.getByPlaceholderText(/Bijvoorbeeld/);
      expect(textarea).toHaveAttribute('maxLength', '1000');
    });
  });
});
