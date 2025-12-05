import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Search, Plus, Moon, Sun, Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAudits } from '../../context/AuditContext';
import Button from '../ui/Button';

// Sync status indicator component
const SyncIndicator = ({ syncStatus, isOnline }) => {
  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: CloudOff,
        color: 'text-slate-400',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        label: 'Offline',
        animate: false,
      };
    }
    switch (syncStatus) {
      case 'syncing':
        return {
          icon: RefreshCw,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/30',
          label: 'Syncing...',
          animate: true,
        };
      case 'synced':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
          label: 'Synced',
          animate: false,
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/30',
          label: 'Sync Error',
          animate: false,
        };
      default:
        return {
          icon: Cloud,
          color: 'text-slate-400',
          bgColor: 'bg-slate-100 dark:bg-slate-800',
          label: 'Ready',
          animate: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${config.bgColor} transition-colors`}
      title={config.label}
    >
      <Icon
        size={14}
        className={`${config.color} ${config.animate ? 'animate-spin' : ''}`}
      />
      <span className={`text-xs font-medium ${config.color} hidden sm:inline`}>
        {config.label}
      </span>
    </motion.div>
  );
};

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { syncStatus, isOnline } = useAudits();

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
          {/* Sync Status Indicator */}
          <SyncIndicator syncStatus={syncStatus} isOnline={isOnline} />

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
