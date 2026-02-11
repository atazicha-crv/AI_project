import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ExpenseReportsService } from './expense-reports.service';
import {
  CreateExpenseReportDto,
  UpdateExpenseReportDto,
  UpdateStatusDto,
  QueryExpenseReportsDto,
} from './dto';
import { FakeAuthGuard } from '../auth/guards';
import { CurrentUser } from '../common/decorators';

@ApiTags('expense-reports')
@ApiBearerAuth()
@UseGuards(FakeAuthGuard)
@Controller('expense-reports')
export class ExpenseReportsController {
  constructor(private readonly expenseReportsService: ExpenseReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense report' })
  @ApiResponse({
    status: 201,
    description: 'Expense report created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @CurrentUser() user: any,
    @Body() createExpenseReportDto: CreateExpenseReportDto,
  ) {
    return this.expenseReportsService.create(user.id, createExpenseReportDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expense reports for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['CREATED', 'SUBMITTED', 'VALIDATED', 'REJECTED', 'PAID'] })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({
    status: 200,
    description: 'List of expense reports',
  })
  findAll(
    @CurrentUser() user: any,
    @Query() query: QueryExpenseReportsDto,
  ) {
    return this.expenseReportsService.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense report by ID' })
  @ApiResponse({
    status: 200,
    description: 'Expense report details',
  })
  @ApiResponse({ status: 404, description: 'Expense report not found' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.expenseReportsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update expense report' })
  @ApiResponse({
    status: 200,
    description: 'Expense report updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Expense report not found' })
  @ApiResponse({ status: 409, description: 'Cannot modify expense report in current status' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateExpenseReportDto: UpdateExpenseReportDto,
  ) {
    return this.expenseReportsService.update(id, user.id, updateExpenseReportDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update expense report status' })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Expense report not found' })
  @ApiResponse({ status: 409, description: 'Invalid status transition' })
  @ApiResponse({ status: 422, description: 'Business rule violation' })
  updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.expenseReportsService.updateStatus(id, user.id, updateStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete expense report' })
  @ApiResponse({
    status: 204,
    description: 'Expense report deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Expense report not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete expense report in current status' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.expenseReportsService.remove(id, user.id);
  }
}
