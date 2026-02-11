import { validateStatusTransition, isModifiable } from './status-validator';
import { ExpenseStatus } from '../enums';
import { ConflictException } from '@nestjs/common';

describe('Status Validator', () => {
  describe('validateStatusTransition', () => {
    it('should allow CREATED to SUBMITTED transition', () => {
      expect(() => {
        validateStatusTransition(ExpenseStatus.CREATED, ExpenseStatus.SUBMITTED);
      }).not.toThrow();
    });

    it('should allow SUBMITTED to VALIDATED transition', () => {
      expect(() => {
        validateStatusTransition(ExpenseStatus.SUBMITTED, ExpenseStatus.VALIDATED);
      }).not.toThrow();
    });

    it('should allow SUBMITTED to REJECTED transition', () => {
      expect(() => {
        validateStatusTransition(ExpenseStatus.SUBMITTED, ExpenseStatus.REJECTED);
      }).not.toThrow();
    });

    it('should allow VALIDATED to PAID transition', () => {
      expect(() => {
        validateStatusTransition(ExpenseStatus.VALIDATED, ExpenseStatus.PAID);
      }).not.toThrow();
    });

    it('should throw ConflictException for invalid transition', () => {
      expect(() => {
        validateStatusTransition(ExpenseStatus.CREATED, ExpenseStatus.PAID);
      }).toThrow(ConflictException);
    });

    it('should throw ConflictException when transitioning from REJECTED', () => {
      expect(() => {
        validateStatusTransition(ExpenseStatus.REJECTED, ExpenseStatus.SUBMITTED);
      }).toThrow(ConflictException);
    });

    it('should throw ConflictException when transitioning from PAID', () => {
      expect(() => {
        validateStatusTransition(ExpenseStatus.PAID, ExpenseStatus.VALIDATED);
      }).toThrow(ConflictException);
    });
  });

  describe('isModifiable', () => {
    it('should return true for CREATED status', () => {
      expect(isModifiable(ExpenseStatus.CREATED)).toBe(true);
    });

    it('should return true for SUBMITTED status', () => {
      expect(isModifiable(ExpenseStatus.SUBMITTED)).toBe(true);
    });

    it('should return false for VALIDATED status', () => {
      expect(isModifiable(ExpenseStatus.VALIDATED)).toBe(false);
    });

    it('should return false for REJECTED status', () => {
      expect(isModifiable(ExpenseStatus.REJECTED)).toBe(false);
    });

    it('should return false for PAID status', () => {
      expect(isModifiable(ExpenseStatus.PAID)).toBe(false);
    });
  });
});
