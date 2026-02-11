import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseReport } from './entities/expense-report.entity';
import {
  CreateExpenseReportDto,
  UpdateExpenseReportDto,
  UpdateStatusDto,
  QueryExpenseReportsDto,
} from './dto';
import { ExpenseStatus } from '../common/enums';
import { validateStatusTransition, isModifiable } from '../common/helpers';

@Injectable()
export class ExpenseReportsService {
  constructor(
    @InjectRepository(ExpenseReport)
    private readonly expenseReportRepository: Repository<ExpenseReport>,
  ) {}

  async create(
    userId: string,
    createExpenseReportDto: CreateExpenseReportDto,
  ): Promise<ExpenseReport> {
    const expenseReport = this.expenseReportRepository.create({
      ...createExpenseReportDto,
      userId,
      status: ExpenseStatus.CREATED,
      totalAmount: 0,
    });

    return this.expenseReportRepository.save(expenseReport);
  }

  async findAll(
    userId: string,
    query: QueryExpenseReportsDto,
  ): Promise<{ data: ExpenseReport[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, status, sortBy = 'reportDate', order = 'DESC' } = query;

    const queryBuilder = this.expenseReportRepository
      .createQueryBuilder('report')
      .where('report.userId = :userId', { userId })
      .leftJoinAndSelect('report.expenses', 'expenses');

    if (status) {
      queryBuilder.andWhere('report.status = :status', { status });
    }

    const total = await queryBuilder.getCount();

    const data = await queryBuilder
      .orderBy(`report.${sortBy}`, order)
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, userId: string): Promise<ExpenseReport> {
    const expenseReport = await this.expenseReportRepository.findOne({
      where: { id, userId },
      relations: ['expenses', 'expenses.attachments'],
    });

    if (!expenseReport) {
      throw new NotFoundException(`Expense report with ID ${id} not found`);
    }

    return expenseReport;
  }

  async update(
    id: string,
    userId: string,
    updateExpenseReportDto: UpdateExpenseReportDto,
  ): Promise<ExpenseReport> {
    const expenseReport = await this.findOne(id, userId);

    if (!isModifiable(expenseReport.status)) {
      throw new ConflictException(
        `Cannot modify expense report with status ${expenseReport.status}`,
      );
    }

    Object.assign(expenseReport, updateExpenseReportDto);
    return this.expenseReportRepository.save(expenseReport);
  }

  async updateStatus(
    id: string,
    userId: string,
    updateStatusDto: UpdateStatusDto,
  ): Promise<ExpenseReport> {
    const expenseReport = await this.findOne(id, userId);

    validateStatusTransition(expenseReport.status, updateStatusDto.status);

    // Check if report has at least one expense when submitting
    if (updateStatusDto.status === ExpenseStatus.SUBMITTED) {
      const expenseCount = await this.expenseReportRepository
        .createQueryBuilder('report')
        .leftJoin('report.expenses', 'expenses')
        .where('report.id = :id', { id })
        .getCount();

      if (expenseCount === 0) {
        throw new UnprocessableEntityException(
          'Cannot submit expense report without expenses',
        );
      }
    }

    expenseReport.status = updateStatusDto.status;

    // Set payment date when status changes to PAID
    if (updateStatusDto.status === ExpenseStatus.PAID) {
      expenseReport.paymentDate = new Date();
    }

    return this.expenseReportRepository.save(expenseReport);
  }

  async remove(id: string, userId: string): Promise<void> {
    const expenseReport = await this.findOne(id, userId);

    if (!isModifiable(expenseReport.status)) {
      throw new ConflictException(
        `Cannot delete expense report with status ${expenseReport.status}`,
      );
    }

    await this.expenseReportRepository.remove(expenseReport);
  }

  /**
   * Recalculates the total amount for an expense report
   * Called by ExpensesService when expenses are created/updated/deleted
   */
  async recalculateTotalAmount(reportId: string): Promise<void> {
    const result = await this.expenseReportRepository
      .createQueryBuilder('report')
      .leftJoin('report.expenses', 'expenses')
      .select('SUM(expenses.amount)', 'total')
      .where('report.id = :reportId', { reportId })
      .getRawOne();

    const totalAmount = parseFloat(result.total) || 0;

    await this.expenseReportRepository.update(reportId, { totalAmount });
  }
}
