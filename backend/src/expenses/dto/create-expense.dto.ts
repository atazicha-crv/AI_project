import {
  IsString,
  IsDateString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseCategory } from '../../common/enums';

export class CreateExpenseDto {
  @ApiProperty({
    description: 'Expense category',
    enum: ExpenseCategory,
    example: ExpenseCategory.TRAVEL,
  })
  @IsEnum(ExpenseCategory)
  @IsNotEmpty()
  category: ExpenseCategory;

  @ApiProperty({
    description: 'Expense name',
    example: 'Train ticket Paris-Lyon',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  expenseName: string;

  @ApiPropertyOptional({
    description: 'Expense description',
    example: 'Business meeting with client',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Expense amount',
    example: 125.50,
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Expense date',
    example: '2026-02-11',
  })
  @IsDateString()
  @IsNotEmpty()
  expenseDate: string;
}
