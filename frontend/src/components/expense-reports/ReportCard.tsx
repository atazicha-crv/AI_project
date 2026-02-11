import React from 'react';
import { ExpenseReport } from '../../types/expense-report.types';
import { CategoryIcon } from './CategoryIcon';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ReportCardProps {
  report: ExpenseReport;
  onClick?: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onClick }) => {
  // Extraire les catégories uniques des dépenses
  const uniqueCategories = Array.from(
    new Set(report.expenses.map(e => e.category))
  );

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-background-dark/50 p-4 rounded-xl shadow-sm space-y-3 cursor-pointer hover:shadow-md transition-shadow"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-foreground-light dark:text-foreground-dark font-semibold">
            {report.title}
          </p>
          <p className="text-sm text-muted-light dark:text-muted-dark">
            {formatDate(report.date)}
          </p>
        </div>
        <p className="text-lg font-bold" style={{ color: '#40B59D' }}>
          {formatCurrency(report.totalAmount)}
        </p>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {uniqueCategories.slice(0, 3).map((category, index) => (
            <CategoryIcon key={index} category={category} />
          ))}
          {uniqueCategories.length > 3 && (
            <span className="text-xs text-muted-light dark:text-muted-dark">
              +{uniqueCategories.length - 3}
            </span>
          )}
        </div>
        <StatusBadge status={report.status} />
      </div>
    </div>
  );
};
