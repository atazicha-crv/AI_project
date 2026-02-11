import React from 'react';
import { ExpenseStatus } from '../../types/expense-report.types';
import { getStatusClassName } from '../../utils/status-utils';

interface StatusBadgeProps {
  status: ExpenseStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className = '' 
}) => {
  const statusClass = getStatusClassName(status);
  
  return (
    <p className={`text-sm font-medium ${statusClass} ${className}`}>
      {status}
    </p>
  );
};
