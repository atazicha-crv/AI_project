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
              // @ts-ignore - framer-motion transition type
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl rounded-t-xl shadow-lg"
              style={{ backgroundColor: '#ffffff' }}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between" style={{ backgroundColor: '#ffffff' }}>
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
              <div className="p-4 space-y-6 max-h-[60vh] overflow-y-auto pb-28">
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
                          ? 'bg-gray-100 border-gray-300 text-gray-900'
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setLocalFilters(prev => ({ ...prev, status: ExpenseStatus.CREATED }))}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left border ${
                        localFilters.status === ExpenseStatus.CREATED
                          ? 'bg-amber-500/10 border-amber-500/20'
                          : 'bg-white border-gray-200'
                      }`}
                      style={{ color: localFilters.status === ExpenseStatus.CREATED ? '#f59e0b' : '#374151' }}
                    >
                      Created
                    </button>
                    <button
                      onClick={() => setLocalFilters(prev => ({ ...prev, status: ExpenseStatus.SUBMITTED }))}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left border ${
                        localFilters.status === ExpenseStatus.SUBMITTED
                          ? 'bg-blue-500/10 border-blue-500/20'
                          : 'bg-white border-gray-200'
                      }`}
                      style={{ color: localFilters.status === ExpenseStatus.SUBMITTED ? '#3b82f6' : '#374151' }}
                    >
                      Submitted
                    </button>
                    <button
                      onClick={() => setLocalFilters(prev => ({ ...prev, status: ExpenseStatus.VALIDATED }))}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left border ${
                        localFilters.status === ExpenseStatus.VALIDATED
                          ? 'bg-lime-500/10 border-lime-500/20'
                          : 'bg-white border-gray-200'
                      }`}
                      style={{ color: localFilters.status === ExpenseStatus.VALIDATED ? '#84cc16' : '#374151' }}
                    >
                      Validated
                    </button>
                    <button
                      onClick={() => setLocalFilters(prev => ({ ...prev, status: ExpenseStatus.DENIED }))}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left border ${
                        localFilters.status === ExpenseStatus.DENIED
                          ? 'bg-red-500/10 border-red-500/20'
                          : 'bg-white border-gray-200'
                      }`}
                      style={{ color: localFilters.status === ExpenseStatus.DENIED ? '#ef4444' : '#374151' }}
                    >
                      Denied
                    </button>
                    <button
                      onClick={() => setLocalFilters(prev => ({ ...prev, status: ExpenseStatus.PAID }))}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left border ${
                        localFilters.status === ExpenseStatus.PAID
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : 'bg-white border-gray-200'
                      }`}
                      style={{ color: localFilters.status === ExpenseStatus.PAID ? '#10b981' : '#374151' }}
                    >
                      Paid
                    </button>
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
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200" style={{ backgroundColor: '#ffffff' }}>
                <div className="flex gap-4">
                  <button
                    onClick={handleClear}
                    className="w-full py-3 rounded-lg text-sm font-bold bg-gray-200 dark:bg-white/10 text-foreground-light dark:text-foreground-dark hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleApply}
                    className="w-full py-3 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
