import { render, screen, fireEvent } from '@testing-library/react';
import ModuleFilter from '../moduleFilter';
import { IChoiceModule } from '../../types';

jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'nl',
  }),
}));

describe('ModuleFilter', () => {
  const createMockModules = (): IChoiceModule[] => [
    {
      _id: '1',
      id: 1,
      name: 'Module 1',
      main_filter: 'Technology',
      location: 'Breda',
      studycredit: 15,
      taal: 'Nederlands',
    } as IChoiceModule,
    {
      _id: '2',
      id: 2,
      name: 'Module 2',
      main_filter: 'Business',
      location: 'Den Bosch',
      studycredit: 30,
      taal: 'Engels',
    } as IChoiceModule,
    {
      _id: '3',
      id: 3,
      name: 'Module 3',
      main_filter: 'Technology',
      location: 'Breda',
      studycredit: 15,
      taal: 'Nederlands',
    } as IChoiceModule,
  ];

  const defaultProps = {
    modules: createMockModules(),
    selectedTags: [] as string[],
    onTagToggle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('filter button', () => {
    it('renders filter trigger button', () => {
      render(<ModuleFilter {...defaultProps} />);
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('shows badge with selected count when tags are selected', () => {
      render(<ModuleFilter {...defaultProps} selectedTags={['Technology', 'Breda']} />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('does not show badge when no tags selected', () => {
      const { container } = render(<ModuleFilter {...defaultProps} />);
      expect(container.querySelector('.filter-badge')).not.toBeInTheDocument();
    });

    it('opens dropdown when clicked', () => {
      render(<ModuleFilter {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Filters'));
      
      expect(screen.getByText('Categorieën')).toBeInTheDocument();
    });

    it('closes dropdown when clicked again', () => {
      render(<ModuleFilter {...defaultProps} />);
      
      const button = screen.getByText('Filters');
      fireEvent.click(button);
      expect(screen.getByText('Categorieën')).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(screen.queryByText('Categorieën')).not.toBeInTheDocument();
    });
  });

  describe('filter sections', () => {
    beforeEach(() => {
      render(<ModuleFilter {...defaultProps} />);
      fireEvent.click(screen.getByText('Filters'));
    });

    it('renders categories section', () => {
      expect(screen.getByText('Categorieën')).toBeInTheDocument();
    });

    it('renders locations section', () => {
      expect(screen.getByText('Locaties')).toBeInTheDocument();
    });

    it('renders credits section', () => {
      expect(screen.getByText('Studiepunten')).toBeInTheDocument();
    });

    it('renders language section', () => {
      expect(screen.getByText('Taal')).toBeInTheDocument();
    });

    it('extracts unique categories from modules', () => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Business')).toBeInTheDocument();
    });

    it('extracts unique locations from modules', () => {
      expect(screen.getByText('Breda')).toBeInTheDocument();
      expect(screen.getByText('Den Bosch')).toBeInTheDocument();
    });

    it('extracts unique credits from modules', () => {
      expect(screen.getByText('15 EC')).toBeInTheDocument();
      expect(screen.getByText('30 EC')).toBeInTheDocument();
    });

    it('extracts unique languages from modules', () => {
      expect(screen.getByText('Nederlands')).toBeInTheDocument();
      expect(screen.getByText('Engels')).toBeInTheDocument();
    });
  });

  describe('checkbox interaction', () => {
    it('calls onTagToggle when checkbox is clicked', () => {
      const onTagToggle = jest.fn();
      render(<ModuleFilter {...defaultProps} onTagToggle={onTagToggle} />);
      
      fireEvent.click(screen.getByText('Filters'));
      
      const checkbox = screen.getByRole('checkbox', { name: /Technology/i });
      fireEvent.click(checkbox);
      
      expect(onTagToggle).toHaveBeenCalledWith('Technology');
    });

    it('shows checkbox as checked when tag is selected', () => {
      render(<ModuleFilter {...defaultProps} selectedTags={['Technology']} />);
      
      fireEvent.click(screen.getByText('Filters'));
      
      const checkbox = screen.getByRole('checkbox', { name: /Technology/i });
      expect(checkbox).toBeChecked();
    });

    it('shows checkbox as unchecked when tag is not selected', () => {
      render(<ModuleFilter {...defaultProps} selectedTags={[]} />);
      
      fireEvent.click(screen.getByText('Filters'));
      
      const checkbox = screen.getByRole('checkbox', { name: /Technology/i });
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('clear filters button', () => {
    it('shows clear button when tags are selected', () => {
      render(<ModuleFilter {...defaultProps} selectedTags={['Technology']} />);
      
      fireEvent.click(screen.getByText('Filters'));
      
      expect(screen.getByText('Alle filters wissen')).toBeInTheDocument();
    });

    it('does not show clear button when no tags selected', () => {
      render(<ModuleFilter {...defaultProps} selectedTags={[]} />);
      
      fireEvent.click(screen.getByText('Filters'));
      
      expect(screen.queryByText('Alle filters wissen')).not.toBeInTheDocument();
    });

  it('calls onTagToggle for each selected tag when clear is clicked', () => {
      const onTagToggle = jest.fn();
      render(<ModuleFilter {...defaultProps} selectedTags={['Technology', 'Breda']} onTagToggle={onTagToggle} />);
      
      fireEvent.click(screen.getByText('Filters'));
      fireEvent.click(screen.getByText('Alle filters wissen'));
      
      expect(onTagToggle).toHaveBeenCalledTimes(2);
      expect(onTagToggle.mock.calls[0][0]).toBe('Technology');
      expect(onTagToggle.mock.calls[1][0]).toBe('Breda');
    });
  });

  describe('click outside', () => {
    it('closes dropdown when clicking outside', () => {
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <ModuleFilter {...defaultProps} />
        </div>
      );
      
      fireEvent.click(screen.getByText('Filters'));
      expect(screen.getByText('Categorieën')).toBeInTheDocument();
      
      fireEvent.mouseDown(screen.getByTestId('outside'));
      
      expect(screen.queryByText('Categorieën')).not.toBeInTheDocument();
    });
  });

  describe('arrow indicator', () => {
    it('rotates arrow when open', () => {
      const { container } = render(<ModuleFilter {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Filters'));
      
      const arrow = container.querySelector('.filter-arrow');
      expect(arrow).toHaveClass('is-open');
    });

    it('arrow not rotated when closed', () => {
      const { container } = render(<ModuleFilter {...defaultProps} />);
      
      const arrow = container.querySelector('.filter-arrow');
      expect(arrow).not.toHaveClass('is-open');
    });
  });

  describe('edge cases', () => {
    it('handles modules with no main_filter', () => {
      const modules = [{
        _id: '1',
        id: 1,
        name: 'Module 1',
        location: 'Breda',
        studycredit: 15,
        taal: 'Nederlands',
      } as IChoiceModule];
      
      render(<ModuleFilter modules={modules} selectedTags={[]} onTagToggle={jest.fn()} />);
      fireEvent.click(screen.getByText('Filters'));
      
      expect(screen.getByText('Locaties')).toBeInTheDocument();
    });

    it('handles empty modules array', () => {
      render(<ModuleFilter modules={[]} selectedTags={[]} onTagToggle={jest.fn()} />);
      fireEvent.click(screen.getByText('Filters'));
      
      expect(screen.getByText('Categorieën')).toBeInTheDocument();
    });
  });
});
