import { ExpenseCategory } from '../types/expense-report.types';

export const getCategoryIcon = (category: ExpenseCategory): string => {
  return category; // Les valeurs de l'enum sont déjà les noms d'icônes Material
};

export const getCategoryLabel = (category: ExpenseCategory): string => {
  const labels: Record<ExpenseCategory, string> = {
    [ExpenseCategory.MEALS]: 'Meals',
    [ExpenseCategory.TRAVEL]: 'Travel',
    [ExpenseCategory.SUPPLIES]: 'Supplies',
    [ExpenseCategory.TEAM_EVENT]: 'Team Event',
    [ExpenseCategory.PARKING]: 'Parking',
    [ExpenseCategory.ACCOMMODATION]: 'Accommodation',
    [ExpenseCategory.TRANSPORT]: 'Transport',
  };
  return labels[category];
};
