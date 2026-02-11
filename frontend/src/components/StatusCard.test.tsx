import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusCard from './StatusCard';

describe('StatusCard', () => {
  it('should render with ok status', () => {
    render(
      <StatusCard
        title="Test Service"
        status="ok"
        message="Service is running"
      />
    );

    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('Service is running')).toBeInTheDocument();
    expect(screen.getByText('ok')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should render with error status', () => {
    render(
      <StatusCard
        title="Test Service"
        status="error"
        message="Service is down"
      />
    );

    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('Service is down')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
    expect(screen.getByText('✗')).toBeInTheDocument();
  });

  it('should render with loading status', () => {
    render(
      <StatusCard
        title="Test Service"
        status="loading"
        message="Checking service..."
      />
    );

    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('Checking service...')).toBeInTheDocument();
    expect(screen.getByText('loading')).toBeInTheDocument();
    expect(screen.getByText('⟳')).toBeInTheDocument();
  });

  it('should apply correct CSS classes for ok status', () => {
    const { container } = render(
      <StatusCard
        title="Test"
        status="ok"
        message="OK"
      />
    );

    const card = container.querySelector('.bg-green-100');
    expect(card).toBeInTheDocument();
  });

  it('should apply correct CSS classes for error status', () => {
    const { container } = render(
      <StatusCard
        title="Test"
        status="error"
        message="Error"
      />
    );

    const card = container.querySelector('.bg-red-100');
    expect(card).toBeInTheDocument();
  });
});
