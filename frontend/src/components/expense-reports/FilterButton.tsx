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
      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap relative"
      style={{ backgroundColor: 'rgba(64, 181, 157, 0.1)', color: '#40B59D' }}
      aria-label={`Filter and sort${activeFiltersCount > 0 ? ` (${activeFiltersCount} active)` : ''}`}
    >
      <span className="material-symbols-outlined text-base">tune</span>
      <span>Filter & Sort</span>
      {activeFiltersCount > 0 && (
        <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: '#40B59D' }}>
          {activeFiltersCount}
        </span>
      )}
    </button>
  );
};
