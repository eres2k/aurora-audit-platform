import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Mon', audits: 12, score: 85 },
  { name: 'Tue', audits: 18, score: 88 },
  { name: 'Wed', audits: 15, score: 82 },
  { name: 'Thu', audits: 22, score: 91 },
  { name: 'Fri', audits: 28, score: 87 },
  { name: 'Sat', audits: 8, score: 94 },
  { name: 'Sun', audits: 5, score: 89 },
];

export default function TrendChart() {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAudits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF9900" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FF9900" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#007185" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#007185" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            }}
            labelStyle={{ color: '#f8fafc' }}
            itemStyle={{ color: '#94a3b8' }}
          />
          <Area
            type="monotone"
            dataKey="audits"
            stroke="#FF9900"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAudits)"
            name="Audits"
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#007185"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorScore)"
            name="Score"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
