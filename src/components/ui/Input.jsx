import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={20} />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-xl
            bg-slate-50 dark:bg-slate-900
            border border-slate-200 dark:border-slate-700
            text-slate-900 dark:text-slate-100
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            focus:ring-2 focus:ring-amazon-orange/50 focus:border-amazon-orange
            transition-all duration-200 outline-none
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500/50' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
