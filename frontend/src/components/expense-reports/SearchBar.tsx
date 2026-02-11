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
