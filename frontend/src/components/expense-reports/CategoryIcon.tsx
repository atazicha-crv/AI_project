import React from 'react';
import { ExpenseCategory } from '../../types/expense-report.types';
import { getCategoryIcon } from '../../utils/category-icons';

interface CategoryIconProps {
  category: ExpenseCategory;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  category, 
  className = '' 
}) => {
  const iconName = getCategoryIcon(category);
  
  return (
    <div className={`flex items-center justify-center size-8 rounded-full ${className}`} style={{ backgroundColor: 'rgba(64, 181, 157, 0.1)' }}>
      <span className="material-symbols-outlined text-lg" style={{ color: '#40B59D' }}>
        {iconName}
      </span>
    </div>
  );
};
