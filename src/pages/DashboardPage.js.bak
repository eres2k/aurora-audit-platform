import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  CheckCircle,
  Schedule,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/auditService';

const StatCard = ({ title, value, change, icon, color, gradient }) => {
  const isPositive = change >= 0;
  
  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          background: gradient,
          opacity: 0.1,
          transform: 'skewX(-20deg)',
          transformOrigin: 'top right',
        }}
      />
      <CardContent sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" variant="subtitle2" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {isPositive ? (
                <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} />
              )}
              <Typography
                variant="caption"
                sx={{ color: isPositive ? 'success.main' : 'error.main', fontWeight: 500 }}
              >
                {Math.abs(change)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                vs last month
              </Typography>
            </Box>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  const theme = useTheme();
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: auditService.getStats,
  });

  const chartData = [
    { name: 'Jan', audits: 65, completed: 45 },
    { name: 'Feb', audits: 78, completed: 52 },
    { name: 'Mar', audits: 90, completed: 71 },
    { name: 'Apr', audits: 81, completed: 68 },
    { name: 'May', audits: 96, completed: 85 },
    { name: 'Jun', audits: 112, completed: 98 },
  ];

  const recentActivity = [
    { id: 1, title: 'Safety Audit - Building A', status: 'completed', time: '2 hours ago', user: 'John Doe' },
    { id: 2, title: 'Quality Check - Production Line', status: 'in_progress', time: '4 hours ago', user: 'Jane Smith' },
    { id: 3, title: 'Compliance Review - Q2', status: 'pending', time: '1 day ago', user: 'Mike Johnson' },
    { id: 4, title: 'Environmental Assessment', status: 'completed', time: '2 days ago', user: 'Sarah Wilson' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      completed: 'success',
      in_progress: 'warning',
      pending: 'default',
    };
    return colors[status] || 'default';
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Welcome back! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your audits today.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Stat Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Audits"
            value={stats?.totalAudits || 156}
            change={12.5}
            icon={<Assignment />}
            color="primary.main"
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={stats?.inProgress || 23}
            change={-8.3}
            icon={<Schedule />}
            color="warning.main"
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={stats?.completed || 112}
            change={15.7}
            icon={<CheckCircle />}
            color="success.main"
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Efficiency"
            value="94%"
            change={5.2}
            icon={<TrendingUp />}
            color="info.main"
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          />
        </Grid>

        {/* Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Audit Trends
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Monthly audit completion rate
                </Typography>
              </Box>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAudits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <Tooltip />
                <Area type="monotone" dataKey="audits" stroke={theme.palette.primary.main} fillOpacity={1} fill="url(#colorAudits)" />
                <Area type="monotone" dataKey="completed" stroke={theme.palette.success.main} fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Recent Activity */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Activity
              </Typography>
              <Chip label="Today" size="small" />
            </Box>
            <List sx={{ overflow: 'auto', maxHeight: 320 }}>
              {recentActivity.map((activity, index) => (
                <ListItem key={activity.id} alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${getStatusColor(activity.status)}.light`, width: 36, height: 36 }}>
                      {activity.user[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        {activity.title}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={activity.status.replace('_', ' ')}
                          size="small"
                          color={getStatusColor(activity.status)}
                          sx={{ height: 20, textTransform: 'capitalize' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Progress Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Department Progress
            </Typography>
            <Grid container spacing={3}>
              {['Safety', 'Quality', 'Compliance', 'Environmental'].map((dept, index) => {
                const progress = [75, 92, 68, 85][index];
                const color = ['warning', 'success', 'info', 'primary'][index];
                return (
                  <Grid item xs={12} sm={6} md={3} key={dept}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2">{dept}</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: `${color}.lighter`,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: `${color}.main`,
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
