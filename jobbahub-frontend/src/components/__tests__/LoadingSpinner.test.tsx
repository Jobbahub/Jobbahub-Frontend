import { render } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('.loading-spinner-container')).toBeInTheDocument();
  });

  it('renders with default large size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('large');
  });

  it('renders with small size when specified', () => {
    const { container } = render(<LoadingSpinner size="small" />);
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toHaveClass('small');
  });
});