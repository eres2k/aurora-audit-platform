import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar,
  Clock,
} from 'lucide-react';
import { useAudits } from '../context/AuditContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button } from '../components/ui';
import { StatsCard, TrendChart, RecentActivity } from '../components/dashboard';
import { AuditCard } from '../components/audit';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { audits, actions, templates, loading } = useAudits();

  const stats = useMemo(() => {
    const completedAudits = audits.filter(a => a.status === 'completed');
    const openActions = actions.filter(a => a.status === 'open');
    const avgScore = completedAudits.length > 0
      ? Math.round(completedAudits.reduce((sum, a) => sum + (a.score || 0), 0) / completedAudits.length)
      : 0;

    return {
      total: audits.length,
      completed: completedAudits.length,
      openActions: openActions.length,
      avgScore,
    };
  }, [audits, actions]);

  const recentAudits = useMemo(() => {
    return audits
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  }, [audits]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const statsConfig = [
    {
      title: 'Total Audits',
      value: stats.total,
      change: 12,
      changeLabel: 'vs last week',
      icon: ClipboardList,
      color: 'orange',
    },
    {
      title: 'Completed',
      value: stats.completed,
      change: 8,
      changeLabel: 'vs last week',
      icon: CheckCircle,
      color: 'green',
    },
    {
      title: 'Open Actions',
      value: stats.openActions,
      change: -5,
      changeLabel: 'vs last week',
      icon: AlertTriangle,
      color: 'red',
    },
    {
      title: 'Avg Score',
      value: `${stats.avgScore}%`,
      change: 3,
      changeLabel: 'improvement',
      icon: TrendingUp,
      color: 'teal',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white"
          >
            {greeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}!
          </motion.h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening with your audits today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={Calendar}
            onClick={() => navigate('/analytics')}
          >
            View Reports
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/audits/new')}
          >
            New Audit
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
                Weekly Overview
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Audits and scores over time
              </p>
            </div>
            <select className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-none text-sm font-medium outline-none">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <TrendChart />
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
              Recent Activity
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/audits')}>
              View All
            </Button>
          </div>
          <RecentActivity audits={audits} />
        </Card>
      </div>

      {/* Recent Audits */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
            Recent Audits
          </h2>
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/audits')}
          >
            View All
          </Button>
        </div>
        {recentAudits.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentAudits.map((audit, index) => (
              <AuditCard key={audit.id} audit={audit} index={index} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <ClipboardList size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              No audits yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Get started by creating your first audit
            </p>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate('/audits/new')}
            >
              Create Audit
            </Button>
          </Card>
        )}
      </div>

      {/* Quick Start Templates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
            Quick Start Templates
          </h2>
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/templates')}
          >
            Browse All
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {templates.slice(0, 4).map((template, index) => (
            <motion.button
              key={template.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/audits/new?template=${template.id}`)}
              className="card p-4 text-left hover:border-amazon-orange/50 transition-all group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-3"
                style={{ backgroundColor: `${template.color}20` }}
              >
                <Clock size={24} style={{ color: template.color }} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1 group-hover:text-amazon-orange transition-colors">
                {template.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ~{template.estimatedTime} min
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
