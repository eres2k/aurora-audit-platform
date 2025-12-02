import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
} from 'lucide-react';
import { useAudits } from '../context/AuditContext';
import { Card } from '../components/ui';
import { format, subDays, startOfDay } from 'date-fns';

const COLORS = ['#FF9900', '#007185', '#067D62', '#6366F1', '#EF4444'];

export default function Analytics() {
  const { audits, actions, templates } = useAudits();

  const stats = useMemo(() => {
    const completedAudits = audits.filter(a => a.status === 'completed');
    const avgScore = completedAudits.length > 0
      ? Math.round(completedAudits.reduce((sum, a) => sum + (a.score || 0), 0) / completedAudits.length)
      : 0;

    // Get last 7 days data
    const last7Days = [...Array(7)].map((_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      const dayAudits = audits.filter(a => {
        const auditDate = startOfDay(new Date(a.date));
        return auditDate.getTime() === date.getTime();
      });
      const dayCompleted = dayAudits.filter(a => a.status === 'completed');
      const dayAvgScore = dayCompleted.length > 0
        ? Math.round(dayCompleted.reduce((sum, a) => sum + (a.score || 0), 0) / dayCompleted.length)
        : 0;

      return {
        name: format(date, 'EEE'),
        audits: dayAudits.length,
        score: dayAvgScore,
        completed: dayCompleted.length,
      };
    });

    // Template usage
    const templateUsage = templates.map(template => ({
      name: template.title.split(' ').slice(0, 2).join(' '),
      value: audits.filter(a => a.templateId === template.id).length,
      color: template.color,
    })).filter(t => t.value > 0);

    // Score distribution
    const scoreDistribution = [
      { name: '90-100', value: completedAudits.filter(a => a.score >= 90).length, color: '#10B981' },
      { name: '80-89', value: completedAudits.filter(a => a.score >= 80 && a.score < 90).length, color: '#3B82F6' },
      { name: '70-79', value: completedAudits.filter(a => a.score >= 70 && a.score < 80).length, color: '#F59E0B' },
      { name: '60-69', value: completedAudits.filter(a => a.score >= 60 && a.score < 70).length, color: '#F97316' },
      { name: '<60', value: completedAudits.filter(a => a.score < 60).length, color: '#EF4444' },
    ].filter(s => s.value > 0);

    return {
      totalAudits: audits.length,
      completedAudits: completedAudits.length,
      avgScore,
      openActions: actions.filter(a => a.status === 'open').length,
      last7Days,
      templateUsage,
      scoreDistribution,
    };
  }, [audits, actions, templates]);

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(change)}% vs last week</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon size={24} className={`text-${color}-500`} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Insights and trends from your audit data
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Audits</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalAudits}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</p>
          <p className="text-3xl font-bold text-emerald-500 mt-1">{stats.completedAudits}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg Score</p>
          <p className="text-3xl font-bold text-amazon-orange mt-1">{stats.avgScore}%</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Open Actions</p>
          <p className="text-3xl font-bold text-red-500 mt-1">{stats.openActions}</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
                Weekly Trend
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Audits and scores over the past 7 days
              </p>
            </div>
            <BarChart3 size={24} className="text-slate-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="audits" fill="#FF9900" radius={[4, 4, 0, 0]} name="Audits" />
                <Bar dataKey="completed" fill="#007185" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Score Distribution */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
                Score Distribution
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Breakdown of audit scores
              </p>
            </div>
            <PieChartIcon size={24} className="text-slate-400" />
          </div>
          {stats.scoreDistribution.length > 0 ? (
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.scoreDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {stats.scoreDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                    <span className="font-medium text-slate-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              No completed audits yet
            </div>
          )}
        </Card>
      </div>

      {/* Template Usage */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white">
              Template Usage
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Most used audit templates
            </p>
          </div>
          <Calendar size={24} className="text-slate-400" />
        </div>
        {stats.templateUsage.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.templateUsage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Audits">
                  {stats.templateUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-500">
            No audits completed yet
          </div>
        )}
      </Card>
    </div>
  );
}
