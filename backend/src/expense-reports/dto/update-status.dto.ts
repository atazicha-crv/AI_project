import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExpenseStatus } from '../../common/enums';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'New status for the expense report',
    enum: ExpenseStatus,
    example: ExpenseStatus.SUBMITTED,
  })
  @IsEnum(ExpenseStatus)
  @IsNotEmpty()
  status: ExpenseStatus;
}
