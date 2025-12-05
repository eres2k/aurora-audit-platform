import React from 'react';
import { motion } from 'framer-motion';

// Base skeleton element with shimmer animation
export const Skeleton = ({ className = '', variant = 'default' }) => {
  const baseClasses = 'bg-slate-200 dark:bg-slate-700 rounded animate-pulse';

  const variantClasses = {
    default: '',
    circular: 'rounded-full',
    text: 'h-4',
    title: 'h-6',
    button: 'h-10 rounded-xl',
    card: 'rounded-2xl',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

// Skeleton for a card with content
export const SkeletonCard = ({ hasImage = false, lines = 3 }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
    {hasImage && (
      <Skeleton className="w-full h-40 rounded-xl" />
    )}
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" className="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="title" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-2/3' : 'w-full'}
        />
      ))}
    </div>
  </div>
);

// Skeleton for a list item
export const SkeletonListItem = () => (
  <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
    <Skeleton variant="circular" className="w-12 h-12" />
    <div className="flex-1 space-y-2">
      <Skeleton variant="title" className="w-1/3" />
      <Skeleton variant="text" className="w-2/3" />
    </div>
    <Skeleton variant="button" className="w-20" />
  </div>
);

// Skeleton for a table row
export const SkeletonTableRow = ({ columns = 4 }) => (
  <tr className="border-b border-slate-200 dark:border-slate-700">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton variant="text" className={`w-${i === 0 ? 'full' : '3/4'}`} />
      </td>
    ))}
  </tr>
);

// Skeleton for stats/dashboard cards
export const SkeletonStats = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton variant="circular" className="w-12 h-12" />
      <Skeleton className="w-16 h-6 rounded-lg" />
    </div>
    <div className="space-y-2">
      <Skeleton variant="title" className="w-24 h-8" />
      <Skeleton variant="text" className="w-32" />
    </div>
  </div>
);

// Loading overlay for data fetching
export const LoadingOverlay = ({ isLoading, children, skeleton }) => {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {skeleton}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

// Skeleton grid for multiple cards
export const SkeletonGrid = ({ count = 4, columns = 2, cardType = 'default' }) => {
  const CardComponent = cardType === 'stats' ? SkeletonStats : SkeletonCard;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardComponent key={i} />
      ))}
    </div>
  );
};

// Page loading skeleton with header
export const PageLoadingSkeleton = ({ title = true, stats = true, list = true }) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    {title && (
      <div className="space-y-2">
        <Skeleton variant="title" className="w-48 h-8" />
        <Skeleton variant="text" className="w-64" />
      </div>
    )}

    {stats && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStats key={i} />
        ))}
      </div>
    )}

    {list && (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    )}
  </div>
);

export default Skeleton;
