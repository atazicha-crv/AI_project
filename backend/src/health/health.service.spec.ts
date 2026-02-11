import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let dataSource: DataSource;

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return healthy status when database is connected', async () => {
      mockDataSource.query.mockResolvedValue([{ '1': 1 }]);

      const result = await service.checkHealth();

      expect(result.status).toBe('ok');
      expect(result.api.status).toBe('ok');
      expect(result.database.status).toBe('ok');
      expect(result.database.message).toBe('Database connection is healthy');
      expect(result.timestamp).toBeDefined();
      expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should return error status when database connection fails', async () => {
      const dbError = new Error('Connection failed');
      mockDataSource.query.mockRejectedValue(dbError);

      const result = await service.checkHealth();

      expect(result.status).toBe('error');
      expect(result.api.status).toBe('ok');
      expect(result.database.status).toBe('error');
      expect(result.database.message).toContain('Database connection failed');
      expect(result.timestamp).toBeDefined();
    });

    it('should include timestamp in ISO format', async () => {
      mockDataSource.query.mockResolvedValue([{ '1': 1 }]);

      const result = await service.checkHealth();

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});
