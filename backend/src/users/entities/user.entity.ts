import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ExpenseReport } from '../../expense-reports/entities/expense-report.entity';
import { UserRole } from '../../common/enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Column({ type: 'uuid', nullable: true })
  managerId: string | null;

  @OneToMany(() => ExpenseReport, (report) => report.user, {
    cascade: true,
  })
  expenseReports: ExpenseReport[];

  @CreateDateColumn()
  createdAt: Date;
}
