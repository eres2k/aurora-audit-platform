import React from 'react';
import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  hover = false,
  padding = true,
  onClick,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02, y: -2 } : {}}
      onClick={onClick}
      className={`
        bg-white dark:bg-slate-800 rounded-2xl
        shadow-xl shadow-slate-200/50 dark:shadow-none
        border border-slate-100 dark:border-slate-700
        ${padding ? 'p-5' : ''}
        ${hover || onClick ? 'cursor-pointer transition-shadow hover:shadow-2xl' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
