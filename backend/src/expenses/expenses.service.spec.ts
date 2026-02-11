import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpensesService } from './expenses.service';
import { Expense } from './entities/expense.entity';
import { ExpenseReportsService } from '../expense-reports/expense-reports.service';
import { ExpenseStatus, ExpenseCategory } from '../common/enums';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let repository: Repository<Expense>;
  let expenseReportsService: ExpenseReportsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockExpenseReportsService = {
    findOne: jest.fn(),
    recalculateTotalAmount: jest.fn(),
  };

  const mockUser = { id: 'user-123', email: 'test@example.com', role: 'EMPLOYEE' };
  
  const mockReport = {
    id: 'report-123',
    purpose: 'Business trip',
    status: ExpenseStatus.CREATED,
    userId: 'user-123',
    totalAmount: 0,
  };

  const mockExpense = {
    id: 'expense-123',
    category: ExpenseCategory.TRAVEL,
    expenseName: 'Train ticket',
    description: 'Paris to Lyon',
    amount: 125.50,
    expenseDate: new Date('2026-02-11'),
    status: ExpenseStatus.CREATED,
    reportId: 'report-123',
    report: mockReport,
    attachments: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: getRepositoryToken(Expense),
          useValue: mockRepository,
        },
        {
          provide: ExpenseReportsService,
          useValue: mockExpenseReportsService,
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    repository = module.get<Repository<Expense>>(getRepositoryToken(Expense));
    expenseReportsService = module.get<ExpenseReportsService>(ExpenseReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new expense and trigger recalculation', async () => {
      const createDto = {
        category: ExpenseCategory.TRAVEL,
        expenseName: 'Train ticket',
        description: 'Paris to Lyon',
        amount: 125.50,
        expenseDate: '2026-02-11',
      };

      mockExpenseReportsService.findOne.mockResolvedValue(mockReport);
      mockRepository.create.mockReturnValue(mockExpense);
      mockRepository.save.mockResolvedValue(mockExpense);
      mockExpenseReportsService.recalculateTotalAmount.mockResolvedValue(undefined);

      const result = await service.create('report-123', mockUser.id, createDto);

      expect(mockExpenseReportsService.findOne).toHaveBeenCalledWith('report-123', mockUser.id);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        reportId: 'report-123',
        status: ExpenseStatus.CREATED,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockExpense);
      expect(mockExpenseReportsService.recalculateTotalAmount).toHaveBeenCalledWith('report-123');
      expect(result).toEqual(mockExpense);
    });

    it('should throw ConflictException if report is not modifiable', async () => {
      const nonModifiableReport = { ...mockReport, status: ExpenseStatus.PAID };
      mockExpenseReportsService.findOne.mockResolvedValue(nonModifiableReport);

      const createDto = {
        category: ExpenseCategory.TRAVEL,
        expenseName: 'Train ticket',
        description: 'Paris to Lyon',
        amount: 125.50,
        expenseDate: '2026-02-11',
      };

      await expect(service.create('report-123', mockUser.id, createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return an expense', async () => {
      mockRepository.findOne.mockResolvedValue(mockExpense);

      const result = await service.findOne('expense-123', mockUser.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'expense-123' },
        relations: ['report', 'attachments'],
      });
      expect(result).toEqual(mockExpense);
    });

    it('should throw NotFoundException if expense not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('expense-123', mockUser.id)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if expense belongs to different user', async () => {
      const otherUserExpense = { ...mockExpense, report: { ...mockReport, userId: 'other-user' } };
      mockRepository.findOne.mockResolvedValue(otherUserExpense);

      await expect(service.findOne('expense-123', mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an expense and trigger recalculation if amount changed', async () => {
      const updateDto = { amount: 150.00 };
      const updatedExpense = { ...mockExpense, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockExpense);
      mockRepository.save.mockResolvedValue(updatedExpense);
      mockExpenseReportsService.recalculateTotalAmount.mockResolvedValue(undefined);

      const result = await service.update('expense-123', mockUser.id, updateDto);

      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockExpenseReportsService.recalculateTotalAmount).toHaveBeenCalledWith('report-123');
      expect(result.amount).toBe(150.00);
    });

    it('should not trigger recalculation if amount not changed', async () => {
      const updateDto = { description: 'Updated description' };
      const updatedExpense = { ...mockExpense, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockExpense);
      mockRepository.save.mockResolvedValue(updatedExpense);

      await service.update('expense-123', mockUser.id, updateDto);

      expect(mockExpenseReportsService.recalculateTotalAmount).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if expense or report is not modifiable', async () => {
      const nonModifiableExpense = { ...mockExpense, status: ExpenseStatus.PAID };
      mockRepository.findOne.mockResolvedValue(nonModifiableExpense);

      await expect(
        service.update('expense-123', mockUser.id, { amount: 200 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove an expense and trigger recalculation', async () => {
      mockRepository.findOne.mockResolvedValue(mockExpense);
      mockRepository.remove.mockResolvedValue(mockExpense);
      mockExpenseReportsService.recalculateTotalAmount.mockResolvedValue(undefined);

      await service.remove('expense-123', mockUser.id);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockExpense);
      expect(mockExpenseReportsService.recalculateTotalAmount).toHaveBeenCalledWith('report-123');
    });

    it('should throw ConflictException if expense or report is not modifiable', async () => {
      const nonModifiableExpense = { ...mockExpense, report: { ...mockReport, status: ExpenseStatus.VALIDATED } };
      mockRepository.findOne.mockResolvedValue(nonModifiableExpense);

      await expect(service.remove('expense-123', mockUser.id)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllByReport', () => {
    it('should return all expenses for a report', async () => {
      const expenses = [mockExpense];
      mockExpenseReportsService.findOne.mockResolvedValue(mockReport);
      mockRepository.find.mockResolvedValue(expenses);

      const result = await service.findAllByReport('report-123', mockUser.id);

      expect(mockExpenseReportsService.findOne).toHaveBeenCalledWith('report-123', mockUser.id);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { reportId: 'report-123' },
        relations: ['attachments'],
        order: { expenseDate: 'DESC' },
      });
      expect(result).toEqual(expenses);
    });
  });
});
