import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto, UpdateExpenseDto } from './dto';
import { ExpenseReportsService } from '../expense-reports/expense-reports.service';
import { UpdateStatusDto } from '../expense-reports/dto';
import { ExpenseStatus } from '../common/enums';
import { validateStatusTransition, isModifiable } from '../common/helpers';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly expenseReportsService: ExpenseReportsService,
  ) {}

  async create(
    reportId: string,
    userId: string,
    createExpenseDto: CreateExpenseDto,
  ): Promise<Expense> {
    // Verify report exists and belongs to user
    const report = await this.expenseReportsService.findOne(reportId, userId);

    if (!isModifiable(report.status)) {
      throw new ConflictException(
        `Cannot add expenses to report with status ${report.status}`,
      );
    }

    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      reportId,
      status: ExpenseStatus.CREATED,
    });

    const savedExpense = await this.expenseRepository.save(expense);

    // Recalculate report total amount
    await this.expenseReportsService.recalculateTotalAmount(reportId);

    return savedExpense;
  }

  async findAllByReport(reportId: string, userId: string): Promise<Expense[]> {
    // Verify report exists and belongs to user
    await this.expenseReportsService.findOne(reportId, userId);

    return this.expenseRepository.find({
      where: { reportId },
      relations: ['attachments'],
      order: { expenseDate: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id },
      relations: ['report', 'attachments'],
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    // Verify expense belongs to user's report
    if (expense.report.userId !== userId) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    return expense;
  }

  async update(
    id: string,
    userId: string,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    const expense = await this.findOne(id, userId);

    if (!isModifiable(expense.status) || !isModifiable(expense.report.status)) {
      throw new ConflictException(
        `Cannot modify expense with status ${expense.status} or report status ${expense.report.status}`,
      );
    }

    Object.assign(expense, updateExpenseDto);
    const updatedExpense = await this.expenseRepository.save(expense);

    // Recalculate report total amount if amount changed
    if (updateExpenseDto.amount !== undefined) {
      await this.expenseReportsService.recalculateTotalAmount(expense.reportId);
    }

    return updatedExpense;
  }

  async updateStatus(
    id: string,
    userId: string,
    updateStatusDto: UpdateStatusDto,
  ): Promise<Expense> {
    const expense = await this.findOne(id, userId);

    validateStatusTransition(expense.status, updateStatusDto.status);

    expense.status = updateStatusDto.status;
    return this.expenseRepository.save(expense);
  }

  async remove(id: string, userId: string): Promise<void> {
    const expense = await this.findOne(id, userId);

    if (!isModifiable(expense.status) || !isModifiable(expense.report.status)) {
      throw new ConflictException(
        `Cannot delete expense with status ${expense.status} or report status ${expense.report.status}`,
      );
    }

    const reportId = expense.reportId;
    await this.expenseRepository.remove(expense);

    // Recalculate report total amount
    await this.expenseReportsService.recalculateTotalAmount(reportId);
  }
}
