import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ScoreDisplay({ score, size = 'md', criticalFailed = false }) {
  if (score === null || score === undefined) return null;

  const sizes = {
    sm: { container: 'w-16 h-16', text: 'text-xl', icon: 16 },
    md: { container: 'w-24 h-24', text: 'text-3xl', icon: 20 },
    lg: { container: 'w-32 h-32', text: 'text-4xl', icon: 24 },
  };

  const getGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getColor = () => {
    if (criticalFailed) return { bg: 'bg-red-500', text: 'text-red-500' };
    if (score >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-500' };
    if (score >= 60) return { bg: 'bg-amber-500', text: 'text-amber-500' };
    return { bg: 'bg-red-500', text: 'text-red-500' };
  };

  const colors = getColor();
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${sizes[size].container}`}>
        {/* Background Circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-200 dark:text-slate-700"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={colors.text}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>

        {/* Grade */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className={`font-display font-bold ${sizes[size].text} ${colors.text}`}
          >
            {getGrade(score)}
          </motion.span>
        </div>
      </div>

      {/* Details */}
      <div className="text-center">
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {score}%
        </p>
        {criticalFailed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mt-2 text-red-500"
          >
            <AlertTriangle size={sizes[size].icon} />
            <span className="text-sm font-medium">Critical items failed</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
