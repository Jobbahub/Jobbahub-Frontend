import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../modulePagination';

describe('Pagination', () => {
  const defaultProps = {
    totalPages: 10,
    currentPage: 1,
    onPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders pagination navigation', () => {
      render(<Pagination {...defaultProps} />);
      const nav = screen.getByRole('navigation', { name: /paginering/i });
      expect(nav).toBeInTheDocument();
    });

    it('renders previous and next buttons', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByLabelText('Vorige pagina')).toBeInTheDocument();
      expect(screen.getByLabelText('Volgende pagina')).toBeInTheDocument();
    });

    it('renders first and last page numbers', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    });

    it('marks current page as active', () => {
      render(<Pagination {...defaultProps} currentPage={5} />);
      const button = screen.getByRole('button', { name: '5' });
      expect(button).toHaveClass('active');
      expect(button).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('navigation', () => {
    it('calls onPageChange when clicking a page number', () => {
      const onPageChange = jest.fn();
      render(<Pagination {...defaultProps} currentPage={1} onPageChange={onPageChange} />);
      
      fireEvent.click(screen.getByRole('button', { name: '10' }));
      expect(onPageChange).toHaveBeenCalledWith(10);
    });

    it('calls onPageChange when clicking next button', () => {
      const onPageChange = jest.fn();
      render(<Pagination {...defaultProps} currentPage={1} onPageChange={onPageChange} />);
      
      fireEvent.click(screen.getByLabelText('Volgende pagina'));
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange when clicking previous button', () => {
      const onPageChange = jest.fn();
      render(<Pagination {...defaultProps} currentPage={5} onPageChange={onPageChange} />);
      
      fireEvent.click(screen.getByLabelText('Vorige pagina'));
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('does not call onPageChange when clicking current page', () => {
      const onPageChange = jest.fn();
      render(<Pagination {...defaultProps} currentPage={1} onPageChange={onPageChange} />);
      
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled states', () => {
    it('disables previous button on first page', () => {
      render(<Pagination {...defaultProps} currentPage={1} />);
      const prevButton = screen.getByLabelText('Vorige pagina');
      expect(prevButton).toBeDisabled();
      expect(prevButton).toHaveClass('disabled');
    });

    it('disables next button on last page', () => {
      render(<Pagination {...defaultProps} currentPage={10} />);
      const nextButton = screen.getByLabelText('Volgende pagina');
      expect(nextButton).toBeDisabled();
      expect(nextButton).toHaveClass('disabled');
    });

    it('enables both buttons on middle pages', () => {
      render(<Pagination {...defaultProps} currentPage={5} />);
      const prevButton = screen.getByLabelText('Vorige pagina');
      const nextButton = screen.getByLabelText('Volgende pagina');
      expect(prevButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('ellipsis behavior', () => {
    it('shows ellipsis when there are many pages', () => {
      render(<Pagination {...defaultProps} currentPage={5} />);
      const ellipses = screen.getAllByText('…');
      expect(ellipses.length).toBeGreaterThan(0);
    });

    it('does not show ellipsis with few pages', () => {
      render(<Pagination {...defaultProps} totalPages={3} currentPage={2} />);
      expect(screen.queryByText('…')).not.toBeInTheDocument();
    });
  });

  describe('small page counts', () => {
    it('renders all pages when totalPages is 5 or less', () => {
      render(<Pagination {...defaultProps} totalPages={5} currentPage={3} />);
      
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
    });

    it('handles single page', () => {
      render(<Pagination {...defaultProps} totalPages={1} currentPage={1} />);
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByLabelText('Vorige pagina')).toBeDisabled();
      expect(screen.getByLabelText('Volgende pagina')).toBeDisabled();
    });
  });

  describe('window behavior around current page', () => {
    it('shows neighboring pages around current', () => {
      render(<Pagination {...defaultProps} totalPages={20} currentPage={10} />);
      
      expect(screen.getByRole('button', { name: '9' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '11' })).toBeInTheDocument();
    });
  });
});
