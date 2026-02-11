import {
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseCategory } from '../../common/enums';

export class UpdateExpenseDto {
  @ApiPropertyOptional({
    description: 'Expense category',
    enum: ExpenseCategory,
  })
  @IsEnum(ExpenseCategory)
  @IsOptional()
  category?: ExpenseCategory;

  @ApiPropertyOptional({
    description: 'Expense name',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  expenseName?: string;

  @ApiPropertyOptional({
    description: 'Expense description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Expense amount',
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Expense date',
  })
  @IsDateString()
  @IsOptional()
  expenseDate?: string;
}
