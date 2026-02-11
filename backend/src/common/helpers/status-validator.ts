import { ExpenseStatus } from '../enums';
import { ConflictException } from '@nestjs/common';

/**
 * Valid status transitions for expense reports and expenses
 */
const VALID_TRANSITIONS: Record<ExpenseStatus, ExpenseStatus[]> = {
  [ExpenseStatus.CREATED]: [ExpenseStatus.SUBMITTED],
  [ExpenseStatus.SUBMITTED]: [
    ExpenseStatus.VALIDATED,
    ExpenseStatus.REJECTED,
  ],
  [ExpenseStatus.VALIDATED]: [ExpenseStatus.PAID],
  [ExpenseStatus.REJECTED]: [],
  [ExpenseStatus.PAID]: [],
};

/**
 * Validates if a status transition is allowed
 * @param currentStatus Current status
 * @param newStatus Desired new status
 * @throws ConflictException if transition is not allowed
 */
export function validateStatusTransition(
  currentStatus: ExpenseStatus,
  newStatus: ExpenseStatus,
): void {
  const allowedTransitions = VALID_TRANSITIONS[currentStatus];

  if (!allowedTransitions.includes(newStatus)) {
    throw new ConflictException(
      `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
        `Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`,
    );
  }
}

/**
 * Checks if an expense report/expense can be modified based on its status
 * @param status Current status
 * @returns true if modifiable, false otherwise
 */
export function isModifiable(status: ExpenseStatus): boolean {
  return status === ExpenseStatus.CREATED || status === ExpenseStatus.SUBMITTED;
}
