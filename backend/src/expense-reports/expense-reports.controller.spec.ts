import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseReportsController } from './expense-reports.controller';
import { ExpenseReportsService } from './expense-reports.service';
import { ExpenseStatus } from '../common/enums';

describe('ExpenseReportsController', () => {
  let controller: ExpenseReportsController;
  let service: ExpenseReportsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = { id: 'user-123', email: 'test@example.com', role: 'EMPLOYEE' };

  const mockExpenseReport = {
    id: 'report-123',
    purpose: 'Business trip',
    reportDate: new Date('2026-02-11'),
    totalAmount: 0,
    status: ExpenseStatus.CREATED,
    userId: 'user-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseReportsController],
      providers: [
        {
          provide: ExpenseReportsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ExpenseReportsController>(ExpenseReportsController);
    service = module.get<ExpenseReportsService>(ExpenseReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an expense report', async () => {
      const createDto = {
        purpose: 'Business trip',
        reportDate: '2026-02-11',
      };

      mockService.create.mockResolvedValue(mockExpenseReport);

      const result = await controller.create(mockUser, createDto);

      expect(service.create).toHaveBeenCalledWith(mockUser.id, createDto);
      expect(result).toEqual(mockExpenseReport);
    });
  });

  describe('findAll', () => {
    it('should return paginated expense reports', async () => {
      const query = { page: 1, limit: 20 };
      const paginatedResult = {
        data: [mockExpenseReport],
        total: 1,
        page: 1,
        limit: 20,
      };

      mockService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(mockUser, query);

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, query);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return an expense report', async () => {
      mockService.findOne.mockResolvedValue(mockExpenseReport);

      const result = await controller.findOne(mockUser, 'report-123');

      expect(service.findOne).toHaveBeenCalledWith('report-123', mockUser.id);
      expect(result).toEqual(mockExpenseReport);
    });
  });

  describe('update', () => {
    it('should update an expense report', async () => {
      const updateDto = { purpose: 'Updated purpose' };
      const updatedReport = { ...mockExpenseReport, ...updateDto };

      mockService.update.mockResolvedValue(updatedReport);

      const result = await controller.update(mockUser, 'report-123', updateDto);

      expect(service.update).toHaveBeenCalledWith('report-123', mockUser.id, updateDto);
      expect(result).toEqual(updatedReport);
    });
  });

  describe('updateStatus', () => {
    it('should update expense report status', async () => {
      const updateStatusDto = { status: ExpenseStatus.SUBMITTED };
      const updatedReport = { ...mockExpenseReport, status: ExpenseStatus.SUBMITTED };

      mockService.updateStatus.mockResolvedValue(updatedReport);

      const result = await controller.updateStatus(mockUser, 'report-123', updateStatusDto);

      expect(service.updateStatus).toHaveBeenCalledWith('report-123', mockUser.id, updateStatusDto);
      expect(result).toEqual(updatedReport);
    });
  });

  describe('remove', () => {
    it('should remove an expense report', async () => {
      mockService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockUser, 'report-123');

      expect(service.remove).toHaveBeenCalledWith('report-123', mockUser.id);
      expect(result).toBeUndefined();
    });
  });
});
