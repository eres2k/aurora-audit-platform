import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  Plus,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: ClipboardList, label: 'Audits', path: '/audits' },
  { icon: Plus, label: 'New', path: '/audits/new', isAction: true },
  { icon: AlertCircle, label: 'Actions', path: '/actions' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
];

export default function MobileNav() {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-40">
      <div className="glass border-t border-slate-200 dark:border-slate-800 safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) =>
            item.isAction ? (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(item.path)}
                className="w-14 h-14 -mt-6 rounded-2xl bg-gradient-to-br from-amazon-orange to-amazon-orange-dark flex items-center justify-center shadow-lg shadow-amazon-orange/40"
              >
                <item.icon size={28} className="text-white" />
              </motion.button>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors
                  ${isActive
                    ? 'text-amazon-orange'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }
                `}
              >
                <item.icon size={24} />
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
