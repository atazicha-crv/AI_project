import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { ExpenseReport } from '../expense-reports/entities/expense-report.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Attachment } from '../attachments/entities/attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_DATABASE || 'data/dev.sqlite',
      entities: [User, ExpenseReport, Expense, Attachment],
      synchronize: process.env.DB_SYNCHRONIZE === 'true' || true,
      logging: process.env.NODE_ENV === 'development',
    }),
  ],
})
export class DatabaseModule {}
