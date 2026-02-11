import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ExpenseReport } from '../../expense-reports/entities/expense-report.entity';
import { Attachment } from '../../attachments/entities/attachment.entity';
import { ExpenseStatus, ExpenseCategory } from '../../common/enums';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  category: ExpenseCategory;

  @Column({ type: 'varchar', length: 255 })
  expenseName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  expenseDate: Date;

  @Column({
    type: 'varchar',
    length: 50,
    default: ExpenseStatus.CREATED,
  })
  status: ExpenseStatus;

  @Column({ type: 'uuid' })
  reportId: string;

  @ManyToOne(() => ExpenseReport, (report) => report.expenses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reportId' })
  report: ExpenseReport;

  @OneToMany(() => Attachment, (attachment) => attachment.expense, {
    cascade: true,
  })
  attachments: Attachment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
