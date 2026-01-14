import { render, screen, fireEvent } from '@testing-library/react';
import ModuleSearch from '../moduleSearch';

jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'nl',
  }),
}));

describe('ModuleSearch', () => {
  const defaultProps = {
    searchTerm: '',
    onSearchChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input', () => {
    render(<ModuleSearch {...defaultProps} />);
    const input = screen.getByPlaceholderText('Zoek een module...');
    expect(input).toBeInTheDocument();
  });

  it('displays the current search term', () => {
    render(<ModuleSearch {...defaultProps} searchTerm="React" />);
    const input = screen.getByDisplayValue('React');
    expect(input).toBeInTheDocument();
  });

  it('calls onSearchChange when user types', () => {
    const onSearchChange = jest.fn();
    render(<ModuleSearch {...defaultProps} onSearchChange={onSearchChange} />);
    
    const input = screen.getByPlaceholderText('Zoek een module...');
    fireEvent.change(input, { target: { value: 'AI' } });
    
    expect(onSearchChange).toHaveBeenCalledWith('AI');
  });

  it('calls onSearchChange for each keystroke', () => {
    const onSearchChange = jest.fn();
    render(<ModuleSearch {...defaultProps} onSearchChange={onSearchChange} />);
    
    const input = screen.getByPlaceholderText('Zoek een module...');
    
    fireEvent.change(input, { target: { value: 'A' } });
    fireEvent.change(input, { target: { value: 'AI' } });
    fireEvent.change(input, { target: { value: 'AI ' } });
    
    expect(onSearchChange).toHaveBeenCalledTimes(3);
  });

  it('handles empty search term', () => {
    const onSearchChange = jest.fn();
    render(<ModuleSearch {...defaultProps} searchTerm="test" onSearchChange={onSearchChange} />);
    
    const input = screen.getByDisplayValue('test');
    fireEvent.change(input, { target: { value: '' } });
    
    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('has correct input type', () => {
    render(<ModuleSearch {...defaultProps} />);
    const input = screen.getByPlaceholderText('Zoek een module...');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('applies correct CSS class to input', () => {
    render(<ModuleSearch {...defaultProps} />);
    const input = screen.getByPlaceholderText('Zoek een module...');
    expect(input).toHaveClass('search-input');
  });

  it('wraps input in search-wrapper div', () => {
    const { container } = render(<ModuleSearch {...defaultProps} />);
    const wrapper = container.querySelector('.search-wrapper');
    expect(wrapper).toBeInTheDocument();
  });
});
