import { HealthResponseDto } from 'shared';
import { apiGet } from './client';

export async function getHealth(): Promise<HealthResponseDto> {
  return apiGet<HealthResponseDto>('/health');
}
