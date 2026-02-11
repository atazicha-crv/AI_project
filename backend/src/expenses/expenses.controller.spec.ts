import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { ExpenseStatus, ExpenseCategory } from '../common/enums';

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let service: ExpensesService;

  const mockService = {
    create: jest.fn(),
    findAllByReport: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = { id: 'user-123', email: 'test@example.com', role: 'EMPLOYEE' };

  const mockExpense = {
    id: 'expense-123',
    category: ExpenseCategory.TRAVEL,
    expenseName: 'Train ticket',
    description: 'Paris to Lyon',
    amount: 125.50,
    expenseDate: new Date('2026-02-11'),
    status: ExpenseStatus.CREATED,
    reportId: 'report-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        {
          provide: ExpensesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ExpensesController>(ExpensesController);
    service = module.get<ExpensesService>(ExpensesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an expense', async () => {
      const createDto = {
        category: ExpenseCategory.TRAVEL,
        expenseName: 'Train ticket',
        description: 'Paris to Lyon',
        amount: 125.50,
        expenseDate: '2026-02-11',
      };

      mockService.create.mockResolvedValue(mockExpense);

      const result = await controller.create(mockUser, 'report-123', createDto);

      expect(service.create).toHaveBeenCalledWith('report-123', mockUser.id, createDto);
      expect(result).toEqual(mockExpense);
    });
  });

  describe('findAllByReport', () => {
    it('should return all expenses for a report', async () => {
      const expenses = [mockExpense];
      mockService.findAllByReport.mockResolvedValue(expenses);

      const result = await controller.findAllByReport(mockUser, 'report-123');

      expect(service.findAllByReport).toHaveBeenCalledWith('report-123', mockUser.id);
      expect(result).toEqual(expenses);
    });
  });

  describe('findOne', () => {
    it('should return an expense', async () => {
      mockService.findOne.mockResolvedValue(mockExpense);

      const result = await controller.findOne(mockUser, 'expense-123');

      expect(service.findOne).toHaveBeenCalledWith('expense-123', mockUser.id);
      expect(result).toEqual(mockExpense);
    });
  });

  describe('update', () => {
    it('should update an expense', async () => {
      const updateDto = { amount: 150.00 };
      const updatedExpense = { ...mockExpense, ...updateDto };

      mockService.update.mockResolvedValue(updatedExpense);

      const result = await controller.update(mockUser, 'expense-123', updateDto);

      expect(service.update).toHaveBeenCalledWith('expense-123', mockUser.id, updateDto);
      expect(result).toEqual(updatedExpense);
    });
  });

  describe('updateStatus', () => {
    it('should update expense status', async () => {
      const updateStatusDto = { status: ExpenseStatus.SUBMITTED };
      const updatedExpense = { ...mockExpense, status: ExpenseStatus.SUBMITTED };

      mockService.updateStatus.mockResolvedValue(updatedExpense);

      const result = await controller.updateStatus(mockUser, 'expense-123', updateStatusDto);

      expect(service.updateStatus).toHaveBeenCalledWith('expense-123', mockUser.id, updateStatusDto);
      expect(result).toEqual(updatedExpense);
    });
  });

  describe('remove', () => {
    it('should remove an expense', async () => {
      mockService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockUser, 'expense-123');

      expect(service.remove).toHaveBeenCalledWith('expense-123', mockUser.id);
      expect(result).toBeUndefined();
    });
  });
});
