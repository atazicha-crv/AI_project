import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusPage from './StatusPage';
import * as useHealthHook from '../hooks/useHealth';
import { HealthResponseDto } from 'shared';

vi.mock('../hooks/useHealth');

describe('StatusPage', () => {
  const mockHealthData: HealthResponseDto = {
    status: 'ok',
    api: { status: 'ok', message: 'API is running' },
    database: { status: 'ok', message: 'Database is healthy' },
    timestamp: '2024-01-01T12:00:00.000Z',
  };

  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    vi.spyOn(useHealthHook, 'useHealth').mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    render(<StatusPage />);

    expect(screen.getByText('System Status Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Checking backend connection...')).toBeInTheDocument();
    expect(screen.getByText('Checking database connection...')).toBeInTheDocument();
  });

  it('should render health data when loaded', () => {
    vi.spyOn(useHealthHook, 'useHealth').mockReturnValue({
      data: mockHealthData,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<StatusPage />);

    expect(screen.getByText('System Status Dashboard')).toBeInTheDocument();
    expect(screen.getByText('API is running')).toBeInTheDocument();
    expect(screen.getByText('Database is healthy')).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('should render error state', () => {
    vi.spyOn(useHealthHook, 'useHealth').mockReturnValue({
      data: null,
      loading: false,
      error: 'Network error',
      refetch: mockRefetch,
    });

    render(<StatusPage />);

    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('System Error')).toBeInTheDocument();
  });

  it('should call refetch when refresh button is clicked', async () => {
    const user = userEvent.setup();

    vi.spyOn(useHealthHook, 'useHealth').mockReturnValue({
      data: mockHealthData,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<StatusPage />);

    const refreshButton = screen.getByRole('button', { name: /Refresh Status/i });
    await user.click(refreshButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('should disable refresh button when loading', () => {
    vi.spyOn(useHealthHook, 'useHealth').mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    render(<StatusPage />);

    const refreshButton = screen.getByRole('button', { name: /Refreshing.../i });
    expect(refreshButton).toBeDisabled();
  });

  it('should display frontend status as ok', () => {
    vi.spyOn(useHealthHook, 'useHealth').mockReturnValue({
      data: mockHealthData,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<StatusPage />);

    expect(screen.getByText('React application is running successfully')).toBeInTheDocument();
  });

  it('should display overall system status', () => {
    vi.spyOn(useHealthHook, 'useHealth').mockReturnValue({
      data: mockHealthData,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<StatusPage />);

    expect(screen.getByText('Overall System Status')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText(/All systems are operational/)).toBeInTheDocument();
  });

  it('should display API documentation link', () => {
    vi.spyOn(useHealthHook, 'useHealth').mockReturnValue({
      data: mockHealthData,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<StatusPage />);

    const link = screen.getByRole('link', { name: /http:\/\/localhost:3000\/docs/i });
    expect(link).toHaveAttribute('href', 'http://localhost:3000/docs');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
