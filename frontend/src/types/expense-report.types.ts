export enum ExpenseStatus {
  CREATED = 'Created',
  SUBMITTED = 'Submitted',
  VALIDATED = 'Validated',
  PAID = 'Paid',
  DENIED = 'Denied'
}

export enum ExpenseCategory {
  MEALS = 'restaurant',
  TRAVEL = 'flight',
  SUPPLIES = 'shopping_cart',
  TEAM_EVENT = 'groups',
  PARKING = 'local_parking',
  ACCOMMODATION = 'hotel',
  TRANSPORT = 'directions_car'
}

export interface Expense {
  id: string;
  reportId: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseReport {
  id: string;
  title: string;
  date: string;
  totalAmount: number;
  status: ExpenseStatus;
  expenses: Expense[];
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  search: string;
  status: ExpenseStatus | null;
  dateFrom: string | null;
  dateTo: string | null;
  amountMin: number;
  amountMax: number;
  categories: ExpenseCategory[];
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
}

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  status: null,
  dateFrom: null,
  dateTo: null,
  amountMin: 0,
  amountMax: 1000,
  categories: [],
  sortBy: 'date',
  sortOrder: 'desc',
};

export interface ActiveFilter {
  key: string;
  label: string;
  value: any;
}
