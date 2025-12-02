import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
  Clock,
} from 'lucide-react';

export default function RecentActivity({ audits = [] }) {
  const activities = audits.slice(0, 5).map((audit, index) => ({
    id: audit.id,
    type: audit.status === 'completed' ? 'audit_completed' : 'audit_started',
    title: `${audit.templateTitle} ${audit.status === 'completed' ? 'completed' : 'started'}`,
    user: audit.createdBy || 'Unknown',
    time: new Date(audit.date),
    score: audit.score,
    location: audit.location,
  }));

  const icons = {
    audit_completed: CheckCircle,
    audit_started: FileText,
    action_created: AlertTriangle,
  };

  const iconColors = {
    audit_completed: 'text-emerald-500 bg-emerald-500/10',
    audit_started: 'text-blue-500 bg-blue-500/10',
    action_created: 'text-amber-500 bg-amber-500/10',
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <FileText size={48} className="mx-auto mb-3 opacity-50" />
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = icons[activity.type] || FileText;
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className={`p-2.5 rounded-xl ${iconColors[activity.type]}`}>
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 dark:text-white truncate">
                {activity.title}
              </p>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {activity.user}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {format(activity.time, 'h:mm a')}
                </span>
              </div>
            </div>
            {activity.score !== null && activity.score !== undefined && (
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                activity.score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                activity.score >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {activity.score}%
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
