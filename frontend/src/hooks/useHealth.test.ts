import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHealth } from './useHealth';
import * as healthApi from '../api/health.api';
import { HealthResponseDto } from 'shared';

vi.mock('../api/health.api');

describe('useHealth', () => {
  const mockHealthData: HealthResponseDto = {
    status: 'ok',
    api: { status: 'ok', message: 'API is running' },
    database: { status: 'ok', message: 'Database is healthy' },
    timestamp: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch health data on mount', async () => {
    vi.spyOn(healthApi, 'getHealth').mockResolvedValue(mockHealthData);

    const { result } = renderHook(() => useHealth());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockHealthData);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    const errorMessage = 'Network error';
    vi.spyOn(healthApi, 'getHealth').mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useHealth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(errorMessage);
  });

  it('should refetch data when refetch is called', async () => {
    vi.spyOn(healthApi, 'getHealth').mockResolvedValue(mockHealthData);

    const { result } = renderHook(() => useHealth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(healthApi.getHealth).toHaveBeenCalledTimes(1);

    await result.current.refetch();

    await waitFor(() => {
      expect(healthApi.getHealth).toHaveBeenCalledTimes(2);
    });
  });

  it('should set loading state during refetch', async () => {
    vi.spyOn(healthApi, 'getHealth').mockResolvedValue(mockHealthData);

    const { result } = renderHook(() => useHealth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const refetchPromise = result.current.refetch();

    expect(result.current.loading).toBe(true);

    await refetchPromise;

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
