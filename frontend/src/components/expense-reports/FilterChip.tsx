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
      className="flex items-center gap-1 text-white text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap"
      style={{ backgroundColor: '#40B59D' }}
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
