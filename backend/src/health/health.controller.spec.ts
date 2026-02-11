import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HealthResponseDto } from 'shared';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  const mockHealthService = {
    checkHealth: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return health status', async () => {
      const mockResponse: HealthResponseDto = {
        status: 'ok',
        api: { status: 'ok', message: 'API is running' },
        database: { status: 'ok', message: 'Database connection is healthy' },
        timestamp: new Date().toISOString(),
      };

      mockHealthService.checkHealth.mockResolvedValue(mockResponse);

      const result = await controller.checkHealth();

      expect(result).toEqual(mockResponse);
      expect(mockHealthService.checkHealth).toHaveBeenCalled();
    });
  });
});
