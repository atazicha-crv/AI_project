# Guide d'Implémentation - Écran Expense Reports

Ce guide fournit le code complet et les instructions étape par étape pour implémenter l'écran "Expense Reports" en React.

---

## Table des Matières

1. [Configuration Initiale](#1-configuration-initiale)
2. [Types TypeScript](#2-types-typescript)
3. [Utilitaires](#3-utilitaires)
4. [Composants Atomiques](#4-composants-atomiques)
5. [Composants Composés](#5-composants-composés)
6. [API Layer](#6-api-layer)
7. [Custom Hooks](#7-custom-hooks)
8. [Page Principale](#8-page-principale)
9. [Styles](#9-styles)
10. [Tests](#10-tests)

---

## 1. Configuration Initiale

### 1.1 Installer les Dépendances

```bash
cd frontend
npm install framer-motion @headlessui/react date-fns
```

### 1.2 Configurer TailwindCSS

```javascript
// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#40B59D',
        'background-light': '#f6f8f7',
        'background-dark': '#12201d',
        'foreground-light': '#1f2937',
        'foreground-dark': '#f9fafb',
        'muted-light': '#6b7280',
        'muted-dark': '#9ca3af',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
```

### 1.3 Ajouter Material Symbols

```html
<!-- frontend/index.html - dans <head> -->
<link 
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" 
  rel="stylesheet"
/>
<link 
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" 
  rel="stylesheet"
/>
```

---

## 2. Types TypeScript

### 2.1 Enums et Interfaces

```typescript
// frontend/src/types/expense-report.types.ts

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
```

---

## 3. Utilitaires

### 3.1 Formatters

```typescript
// frontend/src/utils/formatters.ts

import { format, parseISO } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
};

export const formatDateInput = (dateString: string | null): string => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy-MM-dd');
  } catch {
    return '';
  }
};
```

### 3.2 Category Icons Mapping

```typescript
// frontend/src/utils/category-icons.ts

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
```

### 3.3 Status Utilities

```typescript
// frontend/src/utils/status-utils.ts

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
```

---

## 4. Composants Atomiques

### 4.1 CategoryIcon

```typescript
// frontend/src/components/expense-reports/CategoryIcon.tsx

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
    <div className={`flex items-center justify-center size-8 rounded-full bg-primary/10 ${className}`}>
      <span className="material-symbols-outlined text-primary text-lg">
        {iconName}
      </span>
    </div>
  );
};
```

### 4.2 StatusBadge

```typescript
// frontend/src/components/expense-reports/StatusBadge.tsx

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
```

### 4.3 FilterChip

```typescript
// frontend/src/components/expense-reports/FilterChip.tsx

import React from 'react';
import { motion } from 'framer-motion';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="flex items-center gap-1 bg-primary text-white text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap"
    >
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="text-white/80 hover:text-white transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </motion.div>
  );
};
```

### 4.4 SearchBar

```typescript
// frontend/src/components/expense-reports/SearchBar.tsx

import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Search reports...' 
}) => {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-background-dark/50 text-foreground-light dark:text-foreground-dark border border-gray-200 dark:border-gray-700 focus:ring-primary focus:border-primary focus:outline-none"
        placeholder={placeholder}
        aria-label="Search expense reports"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="material-symbols-outlined text-muted-light dark:text-muted-dark">
          search
        </span>
      </div>
    </div>
  );
};
```

---

## 5. Composants Composés

### 5.1 Header

```typescript
// frontend/src/components/expense-reports/Header.tsx

import React from 'react';

interface HeaderProps {
  title: string;
  onAddClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onAddClick }) => {
  return (
    <header className="sticky top-0 bg-background-light dark:bg-background-dark/80 backdrop-blur-sm z-10">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
        <div className="w-10"></div>
        <h1 className="text-lg font-bold text-foreground-light dark:text-foreground-dark">
          {title}
        </h1>
        <button
          onClick={onAddClick}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
          aria-label="Add new expense report"
        >
          <svg
            className="text-primary"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="12" x2="12" y1="5" y2="19"></line>
            <line x1="5" x2="19" y1="12" y2="12"></line>
          </svg>
        </button>
      </div>
    </header>
  );
};
```

### 5.2 ReportCard

```typescript
// frontend/src/components/expense-reports/ReportCard.tsx

import React from 'react';
import { ExpenseReport, ExpenseCategory } from '../../types/expense-report.types';
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
        <p className="text-lg font-bold text-primary">
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
```

### 5.3 FilterButton

```typescript
// frontend/src/components/expense-reports/FilterButton.tsx

import React from 'react';

interface FilterButtonProps {
  onClick: () => void;
  activeFiltersCount?: number;
}

export const FilterButton: React.FC<FilterButtonProps> = ({ 
  onClick, 
  activeFiltersCount = 0 
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary whitespace-nowrap relative"
      aria-label={`Filter and sort${activeFiltersCount > 0 ? ` (${activeFiltersCount} active)` : ''}`}
    >
      <span className="material-symbols-outlined text-base">tune</span>
      <span>Filter & Sort</span>
      {activeFiltersCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {activeFiltersCount}
        </span>
      )}
    </button>
  );
};
```

### 5.4 FilterModal

```typescript
// frontend/src/components/expense-reports/FilterModal.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { 
  FilterState, 
  ExpenseStatus, 
  ExpenseCategory 
} from '../../types/expense-report.types';
import { getCategoryLabel, getCategoryIcon } from '../../utils/category-icons';
import { formatDateInput } from '../../utils/formatters';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApply,
  onClear,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  const toggleCategory = (category: ExpenseCategory) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          as="div"
          open={isOpen}
          onClose={onClose}
          className="relative z-50"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-end justify-center">
            <Dialog.Panel
              as={motion.div}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl bg-background-light dark:bg-background-dark rounded-t-xl shadow-lg"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                <Dialog.Title className="text-lg font-bold text-foreground-light dark:text-foreground-dark">
                  Filter & Sort
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close filter modal"
                >
                  <span className="material-symbols-outlined text-muted-light dark:text-muted-dark">
                    close
                  </span>
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto pb-24">
                {/* Status Filter */}
                <div>
                  <h3 className="font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                    Status
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setLocalFilters(prev => ({ ...prev, status: null }))}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left border ${
                        localFilters.status === null
                          ? 'bg-primary/10 border-primary/20 text-primary'
                          : 'bg-white dark:bg-white/10 text-foreground-light dark:text-foreground-dark border-gray-200 dark:border-white/20'
                      }`}
                    >
                      All
                    </button>
                    {Object.values(ExpenseStatus).map(status => (
                      <button
                        key={status}
                        onClick={() => setLocalFilters(prev => ({ ...prev, status }))}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left border ${
                          localFilters.status === status
                            ? 'bg-primary/10 border-primary/20 text-primary'
                            : 'bg-white dark:bg-white/10 text-foreground-light dark:text-foreground-dark border-gray-200 dark:border-white/20'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <h3 className="font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                    Date Range
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="start-date"
                        className="text-sm text-muted-light dark:text-muted-dark"
                      >
                        From
                      </label>
                      <input
                        id="start-date"
                        type="date"
                        value={formatDateInput(localFilters.dateFrom)}
                        onChange={(e) =>
                          setLocalFilters(prev => ({ ...prev, dateFrom: e.target.value || null }))
                        }
                        className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-background-dark/50 text-foreground-light dark:text-foreground-dark border border-gray-200 dark:border-gray-700 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="end-date"
                        className="text-sm text-muted-light dark:text-muted-dark"
                      >
                        To
                      </label>
                      <input
                        id="end-date"
                        type="date"
                        value={formatDateInput(localFilters.dateTo)}
                        onChange={(e) =>
                          setLocalFilters(prev => ({ ...prev, dateTo: e.target.value || null }))
                        }
                        className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-background-dark/50 text-foreground-light dark:text-foreground-dark border border-gray-200 dark:border-gray-700 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Amount Range */}
                <div>
                  <h3 className="font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                    Total Amount
                  </h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={localFilters.amountMax}
                      onChange={(e) =>
                        setLocalFilters(prev => ({ ...prev, amountMax: Number(e.target.value) }))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                    />
                    <div className="flex justify-between text-sm text-muted-light dark:text-muted-dark">
                      <span>$0</span>
                      <span>${localFilters.amountMax}+</span>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(ExpenseCategory).map(category => {
                      const isSelected = localFilters.categories.includes(category);
                      return (
                        <button
                          key={category}
                          onClick={() => toggleCategory(category)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
                            isSelected
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : 'bg-white dark:bg-white/10 text-foreground-light dark:text-foreground-dark border-gray-200 dark:border-white/20'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">
                            {getCategoryIcon(category)}
                          </span>
                          <span>{getCategoryLabel(category)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h3 className="font-semibold text-foreground-light dark:text-foreground-dark mb-2">
                    Sort By
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        setLocalFilters(prev => ({
                          ...prev,
                          sortBy: 'amount',
                          sortOrder: 'desc',
                        }))
                      }
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left border ${
                        localFilters.sortBy === 'amount' && localFilters.sortOrder === 'desc'
                          ? 'bg-primary/10 border-primary/20 text-primary'
                          : 'bg-white dark:bg-white/10 text-foreground-light dark:text-foreground-dark border-gray-200 dark:border-white/20'
                      }`}
                    >
                      Amount: High to Low
                    </button>
                    <button
                      onClick={() =>
                        setLocalFilters(prev => ({
                          ...prev,
                          sortBy: 'amount',
                          sortOrder: 'asc',
                        }))
                      }
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left border ${
                        localFilters.sortBy === 'amount' && localFilters.sortOrder === 'asc'
                          ? 'bg-primary/10 border-primary/20 text-primary'
                          : 'bg-white dark:bg-white/10 text-foreground-light dark:text-foreground-dark border-gray-200 dark:border-white/20'
                      }`}
                    >
                      Amount: Low to High
                    </button>
                    <button
                      onClick={() =>
                        setLocalFilters(prev => ({
                          ...prev,
                          sortBy: 'date',
                          sortOrder: 'desc',
                        }))
                      }
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left border ${
                        localFilters.sortBy === 'date' && localFilters.sortOrder === 'desc'
                          ? 'bg-primary/10 border-primary/20 text-primary'
                          : 'bg-white dark:bg-white/10 text-foreground-light dark:text-foreground-dark border-gray-200 dark:border-white/20'
                      }`}
                    >
                      Date: Newest First
                    </button>
                    <button
                      onClick={() =>
                        setLocalFilters(prev => ({
                          ...prev,
                          sortBy: 'date',
                          sortOrder: 'asc',
                        }))
                      }
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left border ${
                        localFilters.sortBy === 'date' && localFilters.sortOrder === 'asc'
                          ? 'bg-primary/10 border-primary/20 text-primary'
                          : 'bg-white dark:bg-white/10 text-foreground-light dark:text-foreground-dark border-gray-200 dark:border-white/20'
                      }`}
                    >
                      Date: Oldest First
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-white/10">
                <div className="flex gap-4">
                  <button
                    onClick={handleClear}
                    className="w-full py-3 rounded-lg text-sm font-bold bg-gray-200 dark:bg-white/10 text-foreground-light dark:text-foreground-dark hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                  >
                    Clear
                  </button>
