import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Header } from '../components/expense-reports/Header';
import { SearchBar } from '../components/expense-reports/SearchBar';
import { FilterButton } from '../components/expense-reports/FilterButton';
import { FilterChip } from '../components/expense-reports/FilterChip';
import { ReportCard } from '../components/expense-reports/ReportCard';
import { FilterModal } from '../components/expense-reports/FilterModal';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { useExpenseReports } from '../hooks/useExpenseReports';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { FilterState, DEFAULT_FILTERS, ActiveFilter } from '../types/expense-report.types';

export const ExpenseReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Debounce search query
  const debouncedSearch = useDebouncedValue(searchQuery, 500);

  // Combine search with filters
  const activeFilters = useMemo<FilterState>(() => ({
    ...filters,
    search: debouncedSearch,
  }), [filters, debouncedSearch]);

  // Fetch reports with active filters
  const { reports, loading, error } = useExpenseReports(activeFilters);

  // Calculate active filter chips
  const filterChips = useMemo<ActiveFilter[]>(() => {
    const chips: ActiveFilter[] = [];

    if (filters.status) {
      chips.push({
        key: 'status',
        label: `Status: ${filters.status}`,
        value: filters.status,
      });
    }

    if (filters.sortBy === 'amount') {
      const order = filters.sortOrder === 'desc' ? 'High to Low' : 'Low to High';
      chips.push({
        key: 'sort',
        label: `Amount: ${order}`,
        value: `${filters.sortBy}-${filters.sortOrder}`,
      });
    }

    if (filters.dateFrom || filters.dateTo) {
      const from = filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : '...';
      const to = filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : '...';
      chips.push({
        key: 'date',
        label: `Date: ${from} - ${to}`,
        value: `${filters.dateFrom}-${filters.dateTo}`,
      });
    }

    if (filters.categories.length > 0) {
      chips.push({
        key: 'categories',
        label: `${filters.categories.length} Categories`,
        value: filters.categories,
      });
    }

    return chips;
  }, [filters]);

  const handleRemoveFilter = (key: string) => {
    setFilters(prev => {
      const updated = { ...prev };
      switch (key) {
        case 'status':
          updated.status = null;
          break;
        case 'sort':
          updated.sortBy = 'date';
          updated.sortOrder = 'desc';
          break;
        case 'date':
          updated.dateFrom = null;
          updated.dateTo = null;
          break;
        case 'categories':
          updated.categories = [];
          break;
      }
      return updated;
    });
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleAddReport = () => {
    navigate('/reports/new');
  };

  const handleReportClick = (reportId: string) => {
    navigate(`/reports/${reportId}`);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f6f8f7' }}>
      <Header title="Expense Reports" onAddClick={handleAddReport} />

      <main className="flex-grow pb-24">
        <div className="p-4 space-y-4">
          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search reports..."
          />

          {/* Filter Button */}
          <div className="flex items-center space-x-2">
            <FilterButton
              onClick={() => setIsFilterModalOpen(true)}
              activeFiltersCount={filterChips.length}
            />
          </div>

          {/* Active Filter Chips */}
          {filterChips.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
              <AnimatePresence>
                {filterChips.map((chip) => (
                  <FilterChip
                    key={chip.key}
                    label={chip.label}
                    onRemove={() => handleRemoveFilter(chip.key)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Reports List */}
        <div className="px-4 space-y-4">
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-background-dark/50 p-4 rounded-xl animate-pulse"
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-red-500 mb-4">
                error
              </span>
              <p className="text-foreground-light dark:text-foreground-dark font-semibold">
                Error loading reports
              </p>
              <p className="text-sm text-muted-light dark:text-muted-dark mt-2">
                {error}
              </p>
            </div>
          )}

          {!loading && !error && reports.length === 0 && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-muted-light dark:text-muted-dark mb-4">
                receipt_long
              </span>
              <p className="text-foreground-light dark:text-foreground-dark font-semibold">
                No reports found
              </p>
              <p className="text-sm text-muted-light dark:text-muted-dark mt-2">
                Try adjusting your filters or create a new report
              </p>
            </div>
          )}

          {!loading && !error && reports.length > 0 && (
            <>
              {reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onClick={() => handleReportClick(report.id)}
                />
              ))}
            </>
          )}
        </div>
      </main>

      <BottomNavigation />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </div>
  );
};
