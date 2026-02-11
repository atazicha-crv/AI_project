export interface HealthResponseDto {
  status: 'ok' | 'error';
  api: {
    status: 'ok';
    message: string;
  };
  database: {
    status: 'ok' | 'error';
    message: string;
  };
  timestamp: string;
}
