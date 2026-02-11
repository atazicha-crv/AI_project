import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HealthResponseDto } from 'shared';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async checkHealth(): Promise<HealthResponseDto> {
    const timestamp = new Date().toISOString();
    let dbStatus: 'ok' | 'error' = 'ok';
    let dbMessage = 'Database connection is healthy';

    try {
      // Test database connection
      await this.dataSource.query('SELECT 1');
    } catch (error) {
      dbStatus = 'error';
      dbMessage = `Database connection failed: ${error.message}`;
      this.logger.error('Database health check failed', error);
    }

    const response: HealthResponseDto = {
      status: dbStatus === 'ok' ? 'ok' : 'error',
      api: {
        status: 'ok',
        message: 'API is running',
      },
      database: {
        status: dbStatus,
        message: dbMessage,
      },
      timestamp,
    };

    return response;
  }
}
