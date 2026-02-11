import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiGet, apiPost, ApiError } from './client';

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('apiGet', () => {
    it('should fetch data successfully', async () => {
      const mockData = { id: 1, name: 'Test' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiGet('/test');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/api/test');
    });

    it('should throw ApiError on HTTP error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(apiGet('/test')).rejects.toThrow(ApiError);
      await expect(apiGet('/test')).rejects.toThrow('API request failed: Not Found');
    });

    it('should throw ApiError on network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(apiGet('/test')).rejects.toThrow(ApiError);
      await expect(apiGet('/test')).rejects.toThrow('Network error: Network error');
    });
  });

  describe('apiPost', () => {
    it('should post data successfully', async () => {
      const mockResponse = { id: 1, success: true };
      const postData = { name: 'Test' };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiPost('/test', postData);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
    });

    it('should throw ApiError on HTTP error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(apiPost('/test', {})).rejects.toThrow(ApiError);
      await expect(apiPost('/test', {})).rejects.toThrow('API request failed: Bad Request');
    });
  });

  describe('ApiError', () => {
    it('should create error with status code', () => {
      const error = new ApiError('Test error', 404);

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(404);
      expect(error.name).toBe('ApiError');
    });
  });
});
