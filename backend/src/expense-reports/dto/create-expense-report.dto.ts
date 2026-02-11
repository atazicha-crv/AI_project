import { IsString, IsDateString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseReportDto {
  @ApiProperty({
    description: 'Purpose of the expense report',
    example: 'Business trip to Paris',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  purpose: string;

  @ApiProperty({
    description: 'Report date',
    example: '2026-02-11',
  })
  @IsDateString()
  @IsNotEmpty()
  reportDate: string;
}
