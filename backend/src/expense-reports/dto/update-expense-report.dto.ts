import { IsString, IsDateString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateExpenseReportDto {
  @ApiPropertyOptional({
    description: 'Purpose of the expense report',
    example: 'Business trip to Paris',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  purpose?: string;

  @ApiPropertyOptional({
    description: 'Report date',
    example: '2026-02-11',
  })
  @IsDateString()
  @IsOptional()
  reportDate?: string;
}
