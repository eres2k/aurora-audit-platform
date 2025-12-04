import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  AlertCircle,
  BarChart3,
  Users,
  Settings,
  LogOut,
  X,
  Zap,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: ClipboardList, label: 'Audits', path: '/audits' },
  { icon: FileText, label: 'Templates', path: '/templates' },
  { icon: AlertCircle, label: 'Actions', path: '/actions' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout, user, selectedStation } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amazon-orange to-amazon-orange-dark flex items-center justify-center shadow-lg shadow-amazon-orange/30">
          <Zap size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            AuditHub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Safety Audits</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amazon-teal to-amazon-green flex items-center justify-center">
            <span className="text-white font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {user?.user_metadata?.full_name || 'User'}
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <MapPin size={12} />
              <span>{selectedStation || 'No station'}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <LogOut size={16} className="text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 z-50 lg:hidden"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} className="text-slate-500" />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
