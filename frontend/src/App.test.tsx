import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

vi.mock('./pages/StatusPage', () => ({
  default: () => <div>StatusPage Mock</div>,
}));

describe('App', () => {
  it('should render StatusPage', () => {
    const { container } = render(<App />);
    expect(container.textContent).toContain('StatusPage Mock');
  });

  it('should have correct root styling', () => {
    const { container } = render(<App />);
    const rootDiv = container.querySelector('.min-h-screen');
    expect(rootDiv).toBeInTheDocument();
    expect(rootDiv).toHaveClass('bg-gray-50');
  });
});
