import { ExpenseStatus } from '../types/expense-report.types';

export const getStatusClassName = (status: ExpenseStatus): string => {
  const classNames: Record<ExpenseStatus, string> = {
    [ExpenseStatus.CREATED]: 'status-created',
    [ExpenseStatus.SUBMITTED]: 'status-submitted',
    [ExpenseStatus.VALIDATED]: 'status-validated',
    [ExpenseStatus.PAID]: 'status-paid',
    [ExpenseStatus.DENIED]: 'status-denied',
  };
  return classNames[status];
};

export const getStatusColor = (status: ExpenseStatus): string => {
  const colors: Record<ExpenseStatus, string> = {
    [ExpenseStatus.CREATED]: 'text-amber-500',
    [ExpenseStatus.SUBMITTED]: 'text-blue-500',
    [ExpenseStatus.VALIDATED]: 'text-lime-500',
    [ExpenseStatus.PAID]: 'text-emerald-500',
    [ExpenseStatus.DENIED]: 'text-red-500',
  };
  return colors[status];
};
