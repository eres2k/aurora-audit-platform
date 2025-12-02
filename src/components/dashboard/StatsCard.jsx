import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color = 'orange',
  index = 0,
}) {
  const colors = {
    orange: {
      bg: 'bg-amazon-orange/10',
      icon: 'text-amazon-orange',
      border: 'border-amazon-orange/20',
    },
    teal: {
      bg: 'bg-amazon-teal/10',
      icon: 'text-amazon-teal',
      border: 'border-amazon-teal/20',
    },
    green: {
      bg: 'bg-amazon-green/10',
      icon: 'text-amazon-green',
      border: 'border-amazon-green/20',
    },
    red: {
      bg: 'bg-red-500/10',
      icon: 'text-red-500',
      border: 'border-red-500/20',
    },
    blue: {
      bg: 'bg-blue-500/10',
      icon: 'text-blue-500',
      border: 'border-blue-500/20',
    },
  };

  const colorClasses = colors[color] || colors.orange;
  const isPositive = change > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`card p-5 border-l-4 ${colorClasses.border}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            {title}
          </p>
          <motion.p
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-3xl font-display font-bold text-slate-900 dark:text-white"
          >
            {value}
          </motion.p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
              {isPositive ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              <span className="font-medium">{Math.abs(change)}%</span>
              <span className="text-slate-500 dark:text-slate-400">{changeLabel}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses.bg}`}>
          <Icon size={24} className={colorClasses.icon} />
        </div>
      </div>
    </motion.div>
  );
}
