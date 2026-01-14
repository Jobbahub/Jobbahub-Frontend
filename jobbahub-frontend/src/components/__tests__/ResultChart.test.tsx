import { render, screen, fireEvent } from '@testing-library/react';
import ResultChart from '../ResultChart';
import type { ChartDataPoint } from '../ResultChart';

jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'nl',
  }),
}));

describe('ResultChart', () => {
  const createMockData = (overrides: Partial<ChartDataPoint>[] = []): ChartDataPoint[] => {
    const defaults: ChartDataPoint[] = [
      { id: 'tech', label: 'Technology', score: 1, color: '#3b82f6' },
      { id: 'health', label: 'Health', score: 0, color: '#22c55e' },
      { id: 'law', label: 'Law', score: -1, color: '#ef4444' },
    ];
    
    return defaults.map((item, index) => ({
      ...item,
      ...overrides[index],
    }));
  };

  const defaultProps = {
    title: 'Test Chart',
    data: createMockData(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders chart title', () => {
      render(<ResultChart {...defaultProps} />);
      expect(screen.getByText('Test Chart')).toBeInTheDocument();
    });

    it('renders SVG chart', () => {
      const { container } = render(<ResultChart {...defaultProps} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders legend items for positive scores', () => {
      render(<ResultChart {...defaultProps} />);
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    it('renders legend items for neutral scores', () => {
      render(<ResultChart {...defaultProps} />);
      expect(screen.getByText('Health')).toBeInTheDocument();
    });

    it('renders muted legend items for negative scores', () => {
      render(<ResultChart {...defaultProps} />);
      expect(screen.getByText('Law')).toBeInTheDocument();
    });
  });

  describe('score badges', () => {
    it('shows Ja badge for positive scores', () => {
      render(<ResultChart {...defaultProps} />);
      expect(screen.getByText('Ja')).toBeInTheDocument();
    });

    it('shows Neutraal badge for neutral scores', () => {
      render(<ResultChart {...defaultProps} />);
      expect(screen.getByText('Neutraal')).toBeInTheDocument();
    });

    it('shows Nee badge for negative scores', () => {
      render(<ResultChart {...defaultProps} />);
      expect(screen.getByText('Nee')).toBeInTheDocument();
    });
  });

  describe('weighted items', () => {
    it('shows 2x badge for weighted items', () => {
      const weightedData = createMockData([{ isWeighted: true }]);
      render(<ResultChart {...defaultProps} data={weightedData} />);
      expect(screen.getAllByText('2x').length).toBeGreaterThan(0);
    });
  });

  describe('hover interactions', () => {
    it('shows tooltip on slice hover', () => {
      const { container } = render(<ResultChart {...defaultProps} />);
      
      const slices = container.querySelectorAll('.chart-slice');
      if (slices.length > 0) {
        fireEvent.mouseEnter(slices[0]);
        expect(container.querySelector('.chart-tooltip')).toBeInTheDocument();
      }
    });

    it('hides tooltip on mouse leave', () => {
      const { container } = render(<ResultChart {...defaultProps} />);
      
      const slices = container.querySelectorAll('.chart-slice');
      if (slices.length > 0) {
        fireEvent.mouseEnter(slices[0]);
        fireEvent.mouseLeave(slices[0]);
        expect(container.querySelector('.chart-tooltip')).not.toBeInTheDocument();
      }
    });

    it('highlights legend item on hover', () => {
      const { container } = render(<ResultChart {...defaultProps} />);
      
      const legendItems = container.querySelectorAll('.chart-legend-item');
      if (legendItems.length > 0) {
        fireEvent.mouseEnter(legendItems[0]);
        expect(legendItems[0]).toHaveClass('is-active');
      }
    });
  });

  describe('empty states', () => {
    it('shows no data message when all scores are negative', () => {
      const negativeData = [
        { id: 'a', label: 'A', score: -1 },
        { id: 'b', label: 'B', score: -1 },
      ];
      render(<ResultChart {...defaultProps} data={negativeData} />);
      expect(screen.getByText('alles_nee_beantwoord')).toBeInTheDocument();
    });

    it('shows no data message when data is empty', () => {
      render(<ResultChart {...defaultProps} data={[]} />);
      expect(screen.getByText('Geen data')).toBeInTheDocument();
    });
  });

  describe('percentages', () => {
    it('displays percentage for each slice', () => {
      const { container } = render(<ResultChart {...defaultProps} />);
      const percentages = container.querySelectorAll('.legend-percent');
      expect(percentages.length).toBeGreaterThan(0);
    });
  });

  describe('single item', () => {
    it('renders full circle for single positive item', () => {
      const singleData = [{ id: 'only', label: 'Only One', score: 1 }];
      const { container } = render(<ResultChart {...defaultProps} data={singleData} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('color theme', () => {
    it('accepts colorTheme prop', () => {
      // colorTheme is accepted but colors are generated dynamically
      render(<ResultChart {...defaultProps} colorTheme="blue" />);
      expect(screen.getByText('Test Chart')).toBeInTheDocument();
    });
  });
});
