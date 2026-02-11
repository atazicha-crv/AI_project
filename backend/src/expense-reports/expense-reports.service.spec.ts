import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseReportsService } from './expense-reports.service';
import { ExpenseReport } from './entities/expense-report.entity';
import { ExpenseStatus } from '../common/enums';
import { NotFoundException, ConflictException, UnprocessableEntityException } from '@nestjs/common';

describe('ExpenseReportsService', () => {
  let service: ExpenseReportsService;
  let repository: Repository<ExpenseReport>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUser = { id: 'user-123', email: 'test@example.com', role: 'EMPLOYEE' };
  
  const mockExpenseReport = {
    id: 'report-123',
    purpose: 'Business trip',
    reportDate: new Date('2026-02-11'),
    totalAmount: 0,
    status: ExpenseStatus.CREATED,
    userId: 'user-123',
    paymentDate: null,
    expenses: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseReportsService,
        {
          provide: getRepositoryToken(ExpenseReport),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ExpenseReportsService>(ExpenseReportsService);
    repository = module.get<Repository<ExpenseReport>>(getRepositoryToken(ExpenseReport));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new expense report', async () => {
      const createDto = {
        purpose: 'Business trip',
        reportDate: '2026-02-11',
      };

      mockRepository.create.mockReturnValue(mockExpenseReport);
      mockRepository.save.mockResolvedValue(mockExpenseReport);

      const result = await service.create(mockUser.id, createDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        userId: mockUser.id,
        status: ExpenseStatus.CREATED,
        totalAmount: 0,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockExpenseReport);
      expect(result).toEqual(mockExpenseReport);
    });
  });

  describe('findOne', () => {
    it('should return an expense report', async () => {
      mockRepository.findOne.mockResolvedValue(mockExpenseReport);

      const result = await service.findOne('report-123', mockUser.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'report-123', userId: mockUser.id },
        relations: ['expenses', 'expenses.attachments'],
      });
      expect(result).toEqual(mockExpenseReport);
    });

    it('should throw NotFoundException if report not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('report-123', mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an expense report', async () => {
      const updateDto = { purpose: 'Updated purpose' };
      const updatedReport = { ...mockExpenseReport, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockExpenseReport);
      mockRepository.save.mockResolvedValue(updatedReport);

      const result = await service.update('report-123', mockUser.id, updateDto);

      expect(result.purpose).toBe('Updated purpose');
    });

    it('should throw ConflictException if report is not modifiable', async () => {
      const nonModifiableReport = { ...mockExpenseReport, status: ExpenseStatus.PAID };
      mockRepository.findOne.mockResolvedValue(nonModifiableReport);

      await expect(
        service.update('report-123', mockUser.id, { purpose: 'New' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateStatus', () => {
    it('should update status to SUBMITTED', async () => {
      const reportWithExpenses = { ...mockExpenseReport, expenses: [{ id: 'exp-1' }] };
      mockRepository.findOne.mockResolvedValue(reportWithExpenses);
      
      const queryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);
      mockRepository.save.mockResolvedValue({ ...reportWithExpenses, status: ExpenseStatus.SUBMITTED });

      const result = await service.updateStatus('report-123', mockUser.id, { status: ExpenseStatus.SUBMITTED });

      expect(result.status).toBe(ExpenseStatus.SUBMITTED);
    });

    it('should throw UnprocessableEntityException when submitting without expenses', async () => {
      mockRepository.findOne.mockResolvedValue(mockExpenseReport);
      
      const queryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await expect(
        service.updateStatus('report-123', mockUser.id, { status: ExpenseStatus.SUBMITTED }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should set paymentDate when status changes to PAID', async () => {
      const validatedReport = { ...mockExpenseReport, status: ExpenseStatus.VALIDATED };
      mockRepository.findOne.mockResolvedValue(validatedReport);
      mockRepository.save.mockImplementation((report) => Promise.resolve(report));

      const result = await service.updateStatus('report-123', mockUser.id, { status: ExpenseStatus.PAID });

      expect(result.paymentDate).toBeDefined();
      expect(result.status).toBe(ExpenseStatus.PAID);
    });
  });

  describe('remove', () => {
    it('should remove an expense report', async () => {
      mockRepository.findOne.mockResolvedValue(mockExpenseReport);
      mockRepository.remove.mockResolvedValue(mockExpenseReport);

      await service.remove('report-123', mockUser.id);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockExpenseReport);
    });

    it('should throw ConflictException if report is not modifiable', async () => {
      const nonModifiableReport = { ...mockExpenseReport, status: ExpenseStatus.VALIDATED };
      mockRepository.findOne.mockResolvedValue(nonModifiableReport);

      await expect(service.remove('report-123', mockUser.id)).rejects.toThrow(ConflictException);
    });
  });

  describe('recalculateTotalAmount', () => {
    it('should recalculate total amount', async () => {
      const queryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '250.50' }),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.recalculateTotalAmount('report-123');

      expect(mockRepository.update).toHaveBeenCalledWith('report-123', { totalAmount: 250.50 });
    });

    it('should set totalAmount to 0 if no expenses', async () => {
      const queryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: null }),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.recalculateTotalAmount('report-123');

      expect(mockRepository.update).toHaveBeenCalledWith('report-123', { totalAmount: 0 });
    });
  });
});
