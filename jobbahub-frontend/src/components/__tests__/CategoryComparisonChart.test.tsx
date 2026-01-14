import { render, screen, fireEvent } from '@testing-library/react';
import CategoryComparisonChart from '../CategoryComparisonChart';

jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'nl',
  }),
}));

jest.mock('../../data/constants', () => ({
  TOPICS: [
    { id: 'q_tech', label: 'Technology', question: 'Do you like tech?', type: 'interest' },
    { id: 'q_health', label: 'Health', question: 'Do you like health?', type: 'value' },
    { id: 'q_research', label: 'Research', question: 'Do you like research?', type: 'goal' },
  ],
}));

describe('CategoryComparisonChart', () => {
  const defaultModuleScores = {
    q_tech: 0.8,
    q_health: 0.5,
    q_research: 0.3,
  };

  const defaultUserAnswers = {
    knoppen_input: {
      q_tech: { score: 1, weight: 1 },
      q_health: { score: 0, weight: 1 },
      q_research: { score: -1, weight: 1 },
    },
  };

  const defaultProps = {
    moduleScores: defaultModuleScores,
    userAnswers: defaultUserAnswers,
    limit: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the component with title', () => {
      render(<CategoryComparisonChart {...defaultProps} />);
      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Module Focus');
    });

    it('renders table headers', () => {
      render(<CategoryComparisonChart {...defaultProps} />);
      expect(screen.getByText('Categorie')).toBeInTheDocument();
      expect(screen.getAllByText('Module Focus').length).toBeGreaterThan(0);
      expect(screen.getByText('Jouw Interesse')).toBeInTheDocument();
    });

    it('renders category labels', () => {
      render(<CategoryComparisonChart {...defaultProps} />);
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Health')).toBeInTheDocument();
    });

    it('renders type badges', () => {
      render(<CategoryComparisonChart {...defaultProps} />);
      expect(screen.getByText('interests_label')).toBeInTheDocument();
      expect(screen.getByText('values_label')).toBeInTheDocument();
      expect(screen.getByText('goals_label')).toBeInTheDocument();
    });
  });

  describe('module score bars', () => {
    it('displays module score percentages', () => {
      render(<CategoryComparisonChart {...defaultProps} />);
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('renders progress bars for module scores', () => {
      const { container } = render(<CategoryComparisonChart {...defaultProps} />);
      const bars = container.querySelectorAll('.module-focus-bar-fill');
      expect(bars.length).toBeGreaterThan(0);
    });
  });

  describe('user interest bars', () => {
    it('displays high interest text for score 1', () => {
      render(<CategoryComparisonChart {...defaultProps} />);
      expect(screen.getByText('Hoge interesse')).toBeInTheDocument();
    });

    it('displays average interest text for score 0', () => {
      render(<CategoryComparisonChart {...defaultProps} />);
      expect(screen.getByText('Gemiddelde interesse')).toBeInTheDocument();
    });

    it('displays low interest text for score -1', () => {
      render(<CategoryComparisonChart {...defaultProps} />);
      expect(screen.getByText('Lage interesse')).toBeInTheDocument();
    });
  });

  describe('tooltip behavior', () => {
    it('shows tooltip on label hover', () => {
      const { container } = render(<CategoryComparisonChart {...defaultProps} />);
      
      const label = screen.getByText('Technology').closest('.module-focus-label');
      fireEvent.mouseEnter(label!);
      
      expect(container.querySelector('.custom-tooltip')).toBeInTheDocument();
    });

    it('hides tooltip on mouse leave', () => {
      const { container } = render(<CategoryComparisonChart {...defaultProps} />);
      
      const label = screen.getByText('Technology').closest('.module-focus-label');
      fireEvent.mouseEnter(label!);
      fireEvent.mouseLeave(label!);
      
      expect(container.querySelector('.custom-tooltip')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('returns null when no userAnswers', () => {
      const { container } = render(
        <CategoryComparisonChart moduleScores={defaultModuleScores} userAnswers={null} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('returns null when userAnswers has no knoppen_input', () => {
      const { container } = render(
        <CategoryComparisonChart moduleScores={defaultModuleScores} userAnswers={{}} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('returns null when no categories have significant scores', () => {
      const lowScores = { q_tech: 0.05, q_health: 0.01 };
      const { container } = render(
        <CategoryComparisonChart moduleScores={lowScores} userAnswers={defaultUserAnswers} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('limit prop', () => {
    it('respects limit prop for number of categories shown', () => {
      const manyScores = {
        q_tech: 0.9,
        q_health: 0.8,
        q_research: 0.7,
        q_extra: 0.6,
      };
      
      render(
        <CategoryComparisonChart 
          moduleScores={manyScores} 
          userAnswers={defaultUserAnswers}
          limit={2}
        />
      );
      
      const rows = document.querySelectorAll('.module-focus-tr');
      expect(rows.length).toBeLessThanOrEqual(2);
    });
  });

  describe('sorting', () => {
    it('sorts categories by module score descending', () => {
      render(<CategoryComparisonChart {...defaultProps} />);
      
      const rows = document.querySelectorAll('.module-focus-tr');
      const firstRowText = rows[0]?.textContent;
      
      // Technology has highest score (0.8), should be first
      expect(firstRowText).toContain('Technology');
    });
  });

  describe('color coding', () => {
    it('uses green for high scores', () => {
      const { container } = render(<CategoryComparisonChart {...defaultProps} />);
      const fills = container.querySelectorAll('.module-focus-bar-fill');
      
      // At least one bar should have green color for 80% score
      const hasGreen = Array.from(fills).some(
        fill => (fill as HTMLElement).style.backgroundColor === 'rgb(34, 197, 94)'
      );
      expect(hasGreen).toBe(true);
    });
  });
});
