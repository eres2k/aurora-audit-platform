import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Bell, Search, Plus, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu size={24} className="text-slate-600 dark:text-slate-400" />
          </button>

          {/* Search - Desktop */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl w-80">
            <Search size={20} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search audits, templates..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400"
            />
            <kbd className="hidden lg:flex items-center gap-0.5 px-2 py-0.5 text-xs font-mono text-slate-400 bg-slate-200 dark:bg-slate-700 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/audits/new')}
            className="hidden sm:flex"
          >
            New Audit
          </Button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? (
              <Sun size={20} className="text-amber-500" />
            ) : (
              <Moon size={20} className="text-slate-600" />
            )}
          </button>

          <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bell size={20} className="text-slate-600 dark:text-slate-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amazon-orange rounded-full" />
          </button>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-amazon-orange to-amazon-teal flex items-center justify-center cursor-pointer"
          >
            <span className="text-white text-sm font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
