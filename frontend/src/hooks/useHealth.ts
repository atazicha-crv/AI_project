import { useState, useEffect, useCallback } from 'react';
import { HealthResponseDto } from 'shared';
import { getHealth } from '../api/health.api';

interface UseHealthResult {
  data: HealthResponseDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHealth(): UseHealthResult {
  const [data, setData] = useState<HealthResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getHealth();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return {
    data,
    loading,
    error,
    refetch: fetchHealth,
  };
}
