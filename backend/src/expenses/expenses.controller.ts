import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto';
import { UpdateStatusDto } from '../expense-reports/dto';
import { FakeAuthGuard } from '../auth/guards';
import { CurrentUser } from '../common/decorators';

@ApiTags('expenses')
@ApiBearerAuth()
@UseGuards(FakeAuthGuard)
@Controller()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post('expense-reports/:reportId/expenses')
  @ApiOperation({ summary: 'Create a new expense for a report' })
  @ApiResponse({
    status: 201,
    description: 'Expense created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Expense report not found' })
  @ApiResponse({ status: 409, description: 'Cannot add expense to report in current status' })
  create(
    @CurrentUser() user: any,
    @Param('reportId') reportId: string,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    return this.expensesService.create(reportId, user.id, createExpenseDto);
  }

  @Get('expense-reports/:reportId/expenses')
  @ApiOperation({ summary: 'Get all expenses for a report' })
  @ApiResponse({
    status: 200,
    description: 'List of expenses',
  })
  @ApiResponse({ status: 404, description: 'Expense report not found' })
  findAllByReport(
    @CurrentUser() user: any,
    @Param('reportId') reportId: string,
  ) {
    return this.expensesService.findAllByReport(reportId, user.id);
  }

  @Get('expenses/:id')
  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiResponse({
    status: 200,
    description: 'Expense details',
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.expensesService.findOne(id, user.id);
  }

  @Patch('expenses/:id')
  @ApiOperation({ summary: 'Update expense' })
  @ApiResponse({
    status: 200,
    description: 'Expense updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 409, description: 'Cannot modify expense in current status' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, user.id, updateExpenseDto);
  }

  @Patch('expenses/:id/status')
  @ApiOperation({ summary: 'Update expense status' })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 409, description: 'Invalid status transition' })
  updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.expensesService.updateStatus(id, user.id, updateStatusDto);
  }

  @Delete('expenses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete expense' })
  @ApiResponse({
    status: 204,
    description: 'Expense deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete expense in current status' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.expensesService.remove(id, user.id);
  }
}
