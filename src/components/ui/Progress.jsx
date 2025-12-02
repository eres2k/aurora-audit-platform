import React from 'react';
import { motion } from 'framer-motion';

export default function Progress({
  value = 0,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = false,
  className = '',
}) {
  const percentage = Math.min((value / max) * 100, 100);

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colors = {
    primary: 'bg-amazon-orange',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    gradient: 'bg-gradient-to-r from-amazon-orange to-amazon-teal',
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Progress
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${colors[color]}`}
        />
      </div>
    </div>
  );
}
