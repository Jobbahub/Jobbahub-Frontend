import { render, screen, fireEvent } from '@testing-library/react';
import ModuleCard from '../moduleCard';
import { IChoiceModule } from '../../types';

jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'nl',
  }),
}));

jest.mock('../../utils/imageUtils', () => ({
  FALLBACK_IMAGE_DATA_URI: 'data:image/png;base64,fallback',
}));

// Mock CategoryComparisonChart
jest.mock('../categoryComparisonChart', () => {
  return function MockCategoryComparisonChart() {
    return <div data-testid="category-comparison-chart">Chart</div>;
  };
});

describe('ModuleCard', () => {
  const createMockModule = (overrides: Partial<IChoiceModule> = {}): IChoiceModule => ({
    _id: 'test-module-1',
    id: 123,
    name: 'Test Module',
    name_en: 'Test Module EN',
    shortdescription: 'Short description in Dutch',
    shortdescription_en: 'Short description in English',
    description: 'Full description',
    description_en: 'Full description EN',
    studycredit: 15,
    main_filter: 'Technology',
    tags_list: "['AI', 'Machine Learning', 'Data Science']",
    location: 'Breda',
    taal: 'Nederlands',
    ...overrides,
  } as IChoiceModule);

  const defaultProps = {
    module: createMockModule(),
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders module name', () => {
      render(<ModuleCard {...defaultProps} />);
      expect(screen.getByText('Test Module')).toBeInTheDocument();
    });

    it('renders module image', () => {
      render(<ModuleCard {...defaultProps} />);
      const image = screen.getByAltText('Test Module');
      expect(image).toBeInTheDocument();
      expect(image).toHaveClass('card-image');
    });

    it('renders study credits', () => {
      render(<ModuleCard {...defaultProps} />);
      expect(screen.getByText('15 EC')).toBeInTheDocument();
    });

    it('renders main filter tag', () => {
      render(<ModuleCard {...defaultProps} />);
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    it('renders short description', () => {
      render(<ModuleCard {...defaultProps} />);
      expect(screen.getByText('Short description in Dutch')).toBeInTheDocument();
    });
  });

  describe('click handling', () => {
    it('calls onClick with module id when card is clicked', () => {
      const onClick = jest.fn();
      render(<ModuleCard {...defaultProps} onClick={onClick} />);

      const card = screen.getByText('Test Module').closest('.card');
      fireEvent.click(card!);

      expect(onClick).toHaveBeenCalledWith('123');
    });
  });

  describe('favorite functionality', () => {
    it('shows favorite button when authenticated', () => {
      render(
        <ModuleCard
          {...defaultProps}
          isAuthenticated={true}
          onToggleFavorite={jest.fn()}
        />
      );
      const favoriteButton = screen.getByTitle(/favorieten/i);
      expect(favoriteButton).toBeInTheDocument();
    });

    it('hides favorite button when not authenticated', () => {
      render(<ModuleCard {...defaultProps} isAuthenticated={false} />);
      const favoriteButton = screen.queryByTitle(/favorieten/i);
      expect(favoriteButton).not.toBeInTheDocument();
    });

    it('shows empty heart when not favorited', () => {
      render(
        <ModuleCard
          {...defaultProps}
          isAuthenticated={true}
          onToggleFavorite={jest.fn()}
          isFavorite={false}
        />
      );
      expect(screen.getByText('♡')).toBeInTheDocument();
    });

    it('shows filled heart when favorited', () => {
      render(
        <ModuleCard
          {...defaultProps}
          isAuthenticated={true}
          onToggleFavorite={jest.fn()}
          isFavorite={true}
        />
      );
      expect(screen.getByText('♥')).toBeInTheDocument();
    });

    it('calls onToggleFavorite when favorite button clicked', () => {
      const onToggleFavorite = jest.fn();
      render(
        <ModuleCard
          {...defaultProps}
          isAuthenticated={true}
          onToggleFavorite={onToggleFavorite}
        />
      );

      const favoriteButton = screen.getByTitle(/favorieten/i);
      fireEvent.click(favoriteButton);

      expect(onToggleFavorite).toHaveBeenCalledWith('test-module-1');
    });

    it('does not trigger card onClick when favorite is clicked', () => {
      const onClick = jest.fn();
      const onToggleFavorite = jest.fn();
      render(
        <ModuleCard
          {...defaultProps}
          onClick={onClick}
          isAuthenticated={true}
          onToggleFavorite={onToggleFavorite}
        />
      );

      const favoriteButton = screen.getByTitle(/favorieten/i);
      fireEvent.click(favoriteButton);

      expect(onToggleFavorite).toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('match badge', () => {
    it('shows match percentage when provided', () => {
      render(<ModuleCard {...defaultProps} matchPercentage={85} />);
      expect(screen.getByText('85% Match')).toBeInTheDocument();
    });

    it('shows rank when provided', () => {
      render(<ModuleCard {...defaultProps} rank={1} />);
      expect(screen.getByText('#1')).toBeInTheDocument();
    });

    it('prefers rank over match percentage', () => {
      render(<ModuleCard {...defaultProps} matchPercentage={85} rank={2} />);
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.queryByText('85% Match')).not.toBeInTheDocument();
    });

    it('shows cluster badge when isCluster is true', () => {
      render(<ModuleCard {...defaultProps} isCluster={true} />);
      expect(screen.getByText('Populair in Cluster')).toBeInTheDocument();
    });
  });

  describe('explanation/why box', () => {
    it('shows explanation when provided', () => {
      render(<ModuleCard {...defaultProps} explanation="Great match for AI interests" />);
      expect(screen.getByText(/Great match for AI interests/)).toBeInTheDocument();
    });

    it('applies cluster styling when isCluster is true', () => {
      const { container } = render(
        <ModuleCard {...defaultProps} explanation="Cluster reason" isCluster={true} />
      );
      const whyBox = container.querySelector('.why-box');
      expect(whyBox).toHaveClass('why-box-cluster');
    });
  });

  describe('tags expansion', () => {
    it('shows tag toggle button when tags exist', () => {
      render(<ModuleCard {...defaultProps} />);
      const toggleButton = screen.getByTitle(/tags/i);
      expect(toggleButton).toBeInTheDocument();
    });

    it('expands tags when toggle button is clicked', () => {
      render(<ModuleCard {...defaultProps} />);

      expect(screen.queryByText('AI')).not.toBeInTheDocument();

      const toggleButton = screen.getByTitle(/tags/i);
      fireEvent.click(toggleButton);

      expect(screen.getByText('AI')).toBeInTheDocument();
      expect(screen.getByText('Machine Learning')).toBeInTheDocument();
    });

    it('does not show toggle when no tags', () => {
      const moduleWithoutTags = createMockModule({ tags_list: '' });
      render(<ModuleCard {...defaultProps} module={moduleWithoutTags} />);
      expect(screen.queryByTitle(/tags/i)).not.toBeInTheDocument();
    });
  });

  describe('category comparison chart', () => {
    it('renders chart when categoryScores and userAnswers provided', () => {
      const categoryScores = { q_tech: 0.8 };
      const userAnswers = { knoppen_input: { q_tech: { score: 1, weight: 1 } } };

      render(
        <ModuleCard
          {...defaultProps}
          categoryScores={categoryScores}
          userAnswers={userAnswers as any}
        />
      );

      expect(screen.getByTestId('category-comparison-chart')).toBeInTheDocument();
    });

    it('does not render chart without categoryScores', () => {
      render(<ModuleCard {...defaultProps} />);
      expect(screen.queryByTestId('category-comparison-chart')).not.toBeInTheDocument();
    });
  });

  describe('image fallback', () => {
    it('uses fallback image on error', () => {
      render(<ModuleCard {...defaultProps} />);
      const image = screen.getByAltText('Test Module') as HTMLImageElement;

      fireEvent.error(image);

      expect(image.src).toBe('data:image/png;base64,fallback');
    });
  });
});
