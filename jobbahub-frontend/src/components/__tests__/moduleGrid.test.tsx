import { render, screen, fireEvent } from '@testing-library/react';
import ModuleGrid from '../moduleGrid';
import { IChoiceModule } from '../../types';

// Mock ModuleCard
jest.mock('../moduleCard', () => {
  return function MockModuleCard({ module, onClick, isFavorite, onToggleFavorite }: {
    module: IChoiceModule;
    onClick: (id: string) => void;
    isFavorite?: boolean;
    onToggleFavorite?: (id: string) => void;
  }) {
    return (
      <div data-testid={`module-card-${module.id}`} onClick={() => onClick(String(module.id))}>
        <span>{module.name}</span>
        {onToggleFavorite && (
          <button 
            data-testid={`favorite-btn-${module.id}`}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(module._id); }}
          >
            {isFavorite ? 'Unfavorite' : 'Favorite'}
          </button>
        )}
      </div>
    );
  };
});

describe('ModuleGrid', () => {
  const createMockModules = (count: number): IChoiceModule[] => {
    return Array.from({ length: count }, (_, i) => ({
      _id: `module-${i + 1}`,
      id: i + 1,
      name: `Module ${i + 1}`,
      studycredit: 15,
    } as IChoiceModule));
  };

  const defaultProps = {
    modules: createMockModules(3),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loading state', () => {
    it('shows loading message when loading is true', () => {
      render(<ModuleGrid {...defaultProps} loading={true} />);
      expect(screen.getByText('Modules laden...')).toBeInTheDocument();
    });

    it('does not render modules while loading', () => {
      render(<ModuleGrid {...defaultProps} loading={true} />);
      expect(screen.queryByTestId('module-card-1')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error message when error is provided', () => {
      render(<ModuleGrid {...defaultProps} error="Something went wrong" />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('does not render modules when error exists', () => {
      render(<ModuleGrid {...defaultProps} error="Error" />);
      expect(screen.queryByTestId('module-card-1')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty message when modules array is empty', () => {
      render(<ModuleGrid modules={[]} />);
      expect(screen.getByText('Geen modules gevonden.')).toBeInTheDocument();
    });
  });

  describe('rendering modules', () => {
    it('renders all modules', () => {
      render(<ModuleGrid {...defaultProps} />);
      
      expect(screen.getByTestId('module-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('module-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('module-card-3')).toBeInTheDocument();
    });

    it('renders module names', () => {
      render(<ModuleGrid {...defaultProps} />);
      
      expect(screen.getByText('Module 1')).toBeInTheDocument();
      expect(screen.getByText('Module 2')).toBeInTheDocument();
      expect(screen.getByText('Module 3')).toBeInTheDocument();
    });

    it('uses grid-container class', () => {
      const { container } = render(<ModuleGrid {...defaultProps} />);
      expect(container.querySelector('.grid-container')).toBeInTheDocument();
    });
  });

  describe('onViewDetails', () => {
    it('calls onViewDetails with correct module id when card is clicked', () => {
      const onViewDetails = jest.fn();
      render(<ModuleGrid {...defaultProps} onViewDetails={onViewDetails} />);
      
      fireEvent.click(screen.getByTestId('module-card-2'));
      
      expect(onViewDetails).toHaveBeenCalledWith('2');
    });

    it('does not crash if onViewDetails is not provided', () => {
      render(<ModuleGrid {...defaultProps} />);
      
      // Should not throw
      fireEvent.click(screen.getByTestId('module-card-1'));
    });
  });

  describe('favorites functionality', () => {
    it('passes isFavorite correctly to ModuleCard', () => {
      render(
        <ModuleGrid 
          {...defaultProps} 
          favorites={['module-2']}
          onToggleFavorite={jest.fn()}
          isAuthenticated={true}
        />
      );
      
      expect(screen.getByTestId('favorite-btn-2')).toHaveTextContent('Unfavorite');
      expect(screen.getByTestId('favorite-btn-1')).toHaveTextContent('Favorite');
    });

    it('calls onToggleFavorite when favorite button clicked', () => {
      const onToggleFavorite = jest.fn();
      render(
        <ModuleGrid 
          {...defaultProps} 
          favorites={[]}
          onToggleFavorite={onToggleFavorite}
          isAuthenticated={true}
        />
      );
      
      fireEvent.click(screen.getByTestId('favorite-btn-1'));
      
      expect(onToggleFavorite).toHaveBeenCalledWith('module-1');
    });

    it('defaults to empty favorites array', () => {
      render(
        <ModuleGrid 
          {...defaultProps} 
          onToggleFavorite={jest.fn()}
          isAuthenticated={true}
        />
      );
      
      expect(screen.getByTestId('favorite-btn-1')).toHaveTextContent('Favorite');
      expect(screen.getByTestId('favorite-btn-2')).toHaveTextContent('Favorite');
    });
  });

  describe('authentication', () => {
    it('passes isAuthenticated to ModuleCards', () => {
      const { rerender } = render(
        <ModuleGrid 
          {...defaultProps} 
          isAuthenticated={false}
        />
      );
      
      expect(screen.queryByTestId('favorite-btn-1')).not.toBeInTheDocument();
      
      rerender(
        <ModuleGrid 
          {...defaultProps} 
          isAuthenticated={true}
          onToggleFavorite={jest.fn()}
        />
      );
      
      expect(screen.getByTestId('favorite-btn-1')).toBeInTheDocument();
    });
  });

  describe('large datasets', () => {
    it('handles rendering many modules', () => {
      const manyModules = createMockModules(100);
      render(<ModuleGrid modules={manyModules} />);
      
      expect(screen.getByTestId('module-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('module-card-100')).toBeInTheDocument();
    });
  });
});
