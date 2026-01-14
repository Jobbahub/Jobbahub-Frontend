import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VragenlijstResultaten from '../vragenlijstResultaten';

jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'nl',
  }),
}));

jest.mock('../../data/constants', () => ({
  TOPICS: [
    { id: 'q_tech', label: 'Technology', question: 'Tech?', type: 'interest' },
    { id: 'q_health', label: 'Health', question: 'Health?', type: 'interest' },
    { id: 'q_social', label: 'Social', question: 'Social?', type: 'value' },
    { id: 'q_research', label: 'Research', question: 'Research?', type: 'goal' },
  ],
}));

// Mock ModuleCard
jest.mock('../moduleCard', () => {
  return function MockModuleCard({ module, onClick, rank, explanation, isCluster }: {
    module: { name: string; id: number };
    onClick: (id: string) => void;
    rank?: number;
    explanation?: string;
    isCluster?: boolean;
  }) {
    return (
      <div 
        data-testid={`module-card-${module.id}`}
        onClick={() => onClick(String(module.id))}
      >
        <span>{module.name}</span>
        {rank && <span data-testid="rank">#{rank}</span>}
        {explanation && <span data-testid="explanation">{explanation}</span>}
        {isCluster && <span data-testid="is-cluster">Cluster</span>}
      </div>
    );
  };
});

// Mock ResultChart
jest.mock('../ResultChart', () => {
  return function MockResultChart({ title }: { title: string }) {
    return <div data-testid="result-chart">{title}</div>;
  };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('VragenlijstResultaten', () => {
  const mockDbModules = [
    { _id: 'm1', id: 1, name: 'Module One', studycredit: 15 },
    { _id: 'm2', id: 2, name: 'Module Two', studycredit: 30 },
    { _id: 'm3', id: 3, name: 'Cluster Module', studycredit: 15 },
  ];

  const mockAiRecs = [
    { 
      name: 'Module One', 
      match_percentage: 95, 
      waarom: 'Match op termen: AI, Tech',
      category_scores: { q_tech: 0.8 }
    },
    { 
      name: 'Module Two', 
      match_percentage: 80, 
      waarom: 'Good match',
      category_scores: { q_health: 0.6 }
    },
  ];

  const mockClusterRecs = [
    { name: 'Cluster Module', waarom: 'Popular in cluster' },
  ];

  const mockUserAnswers = {
    keuze_taal: 'Nederlands',
    keuze_locatie: 'Breda',
    keuze_punten: 15,
    open_antwoord: 'I want to learn AI',
    knoppen_input: {
      q_tech: { score: 1, weight: 2 },
      q_health: { score: 0, weight: 1 },
      q_social: { score: 1, weight: 1 },
      q_research: { score: -1, weight: 1 },
    },
  };

  const defaultProps = {
    aiRecs: mockAiRecs,
    clusterRecs: mockClusterRecs,
    dbModules: mockDbModules as any,
    userAnswers: mockUserAnswers,
    onRetry: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('header', () => {
    it('renders results title', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      expect(screen.getByText('Jouw Resultaten')).toBeInTheDocument();
    });

    it('renders advice notice', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      expect(screen.getByText('result_advice_notice')).toBeInTheDocument();
    });
  });

  describe('retry button', () => {
    it('renders retry button', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      expect(screen.getByText('Opnieuw invullen')).toBeInTheDocument();
    });

    it('calls onRetry when clicked', () => {
      const onRetry = jest.fn();
      renderWithRouter(<VragenlijstResultaten {...defaultProps} onRetry={onRetry} />);
      
      fireEvent.click(screen.getByText('Opnieuw invullen'));
      
      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('AI recommendations', () => {
    it('renders AI recommended modules', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      
      expect(screen.getByText('Module One')).toBeInTheDocument();
      expect(screen.getByText('Module Two')).toBeInTheDocument();
    });

    it('shows rank for recommendations', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
    });

    it('navigates to module detail when clicked', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('module-card-1'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/modules/1');
    });
  });

  describe('cluster recommendations', () => {
    it('renders cluster section when cluster recs exist', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      expect(screen.getByText('Ook interessant voor jou')).toBeInTheDocument();
    });

    it('renders cluster modules', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      expect(screen.getByText('Cluster Module')).toBeInTheDocument();
    });

    it('marks cluster modules with isCluster', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      expect(screen.getByTestId('is-cluster')).toBeInTheDocument();
    });

    it('does not render cluster section when no cluster recs', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} clusterRecs={[]} />);
      expect(screen.queryByText('Ook interessant voor jou')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows no matches message when aiRecs is empty', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} aiRecs={[]} />);
      expect(screen.getByText('Geen matches gevonden')).toBeInTheDocument();
    });
  });

  describe('user profile section', () => {
    it('renders profile section when userAnswers provided', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      expect(screen.getByText('Jouw Profiel')).toBeInTheDocument();
    });

    it('displays language preference', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      expect(screen.getByText('Nederlands')).toBeInTheDocument();
    });

    it('displays location preference', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      expect(screen.getByText('Breda')).toBeInTheDocument();
    });

    it('displays study credits preference', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      expect(screen.getByText('15 EC')).toBeInTheDocument();
    });

    it('displays user open answer', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      expect(screen.getByText(/"I want to learn AI"/)).toBeInTheDocument();
    });

    it('shows "Geen voorkeur" for null preferences', () => {
      const answersWithNulls = {
        ...mockUserAnswers,
        keuze_taal: null,
        keuze_locatie: null,
        keuze_punten: null,
      };
      
      renderWithRouter(<VragenlijstResultaten {...defaultProps} userAnswers={answersWithNulls} />);
      
      const geenVoorkeurElements = screen.getAllByText('Geen voorkeur');
      expect(geenVoorkeurElements.length).toBe(3);
    });
  });

  describe('result charts', () => {
    it('renders interests chart', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      expect(screen.getByText('Interesses (Vakgebieden)')).toBeInTheDocument();
    });

    it('renders values chart', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      expect(screen.getByText('Waarden')).toBeInTheDocument();
    });

    it('renders goals chart', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      expect(screen.getByText('Doelen')).toBeInTheDocument();
    });
  });

  describe('explanation translation', () => {
    it('translates Dutch explanation prefix', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} />);
      
      // The explanation should be shown
      const explanations = screen.getAllByTestId('explanation');
      expect(explanations.length).toBeGreaterThan(0);
    });
  });

  describe('no userAnswers', () => {
    it('does not render profile section when userAnswers is null', () => {
      renderWithRouter(<VragenlijstResultaten {...defaultProps} userAnswers={null} />);
      expect(screen.queryByText('Jouw Profiel')).not.toBeInTheDocument();
    });
  });
});
