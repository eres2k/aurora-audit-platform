import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Camera, AlertTriangle, Star, ChevronDown, MinusCircle } from 'lucide-react';

export default function QuestionItem({
  question,
  value,
  onChange,
  onPhotoCapture,
  note,
  onNoteChange,
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const renderInput = () => {
    switch (question.type) {
      case 'bool':
      case 'yesno':
        return (
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange('pass')}
              className={`
                flex-1 py-3 px-4 rounded-xl font-medium transition-all
                flex items-center justify-center gap-2
                ${value === 'pass'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
            >
              <Check size={20} />
              <span className="hidden sm:inline">Safe</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange('fail')}
              className={`
                flex-1 py-3 px-4 rounded-xl font-medium transition-all
                flex items-center justify-center gap-2
                ${value === 'fail'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
            >
              <X size={20} />
              <span className="hidden sm:inline">Risk</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange('na')}
              className={`
                flex-1 py-3 px-4 rounded-xl font-medium transition-all
                flex items-center justify-center gap-2
                ${value === 'na'
                  ? 'bg-slate-500 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
            >
              <MinusCircle size={20} />
              <span className="hidden sm:inline">N/A</span>
            </motion.button>
          </div>
        );

      case 'rating':
        return (
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((rating) => (
              <motion.button
                key={rating}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onChange(rating)}
                className={`
                  w-12 h-12 rounded-xl flex items-center justify-center transition-all
                  ${value >= rating
                    ? 'bg-amazon-orange text-white shadow-lg shadow-amazon-orange/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }
                `}
              >
                <Star size={24} className={value >= rating ? 'fill-current' : ''} />
              </motion.button>
            ))}
          </div>
        );

      case 'options':
        return (
          <div className="grid grid-cols-2 gap-2">
            {question.options?.map((option) => (
              <motion.button
                key={option}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange(option)}
                className={`
                  py-3 px-4 rounded-xl font-medium text-sm transition-all text-left
                  ${value === option
                    ? 'bg-amazon-orange text-white shadow-lg shadow-amazon-orange/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }
                `}
              >
                {option}
              </motion.button>
            ))}
          </div>
        );

      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            placeholder="Enter your notes..."
            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border-none resize-none focus:ring-2 focus:ring-amazon-orange/50 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
          />
        );

      case 'photo':
        return (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onPhotoCapture}
            className="w-full py-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-amazon-orange hover:bg-amazon-orange/5 transition-all flex flex-col items-center gap-3"
          >
            <div className="w-14 h-14 rounded-full bg-amazon-orange/10 flex items-center justify-center">
              <Camera size={28} className="text-amazon-orange" />
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Tap to capture photo
            </span>
          </motion.button>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-start gap-3 text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {question.critical && (
              <AlertTriangle size={16} className="text-amber-500" />
            )}
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {question.text}
            </span>
          </div>
          {question.required && (
            <span className="text-xs text-red-500">Required</span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-slate-400"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5"
          >
            {renderInput()}

            {/* Note field for failed items */}
            {value === 'fail' && (
              <div className="mt-4 animate-in fade-in">
                <label className="text-xs font-bold text-red-600 uppercase mb-2 block">
                  Describe the issue
                </label>
                <textarea
                  value={note || ''}
                  onChange={(e) => onNoteChange && onNoteChange(e.target.value)}
                  placeholder="Describe the problem..."
                  rows={2}
                  className="w-full text-sm p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-200 placeholder:text-red-300 dark:placeholder:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
