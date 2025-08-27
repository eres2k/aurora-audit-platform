import React, { useState, useEffect, createContext, useContext, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  useMediaQuery,
  Fab
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  PhotoCamera as PhotoCameraIcon,
  GetApp as DownloadIcon,
  Person as PersonIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import netlifyIdentity from 'netlify-identity-widget';

// Lazy load heavy components
const AuditForm = lazy(() => import('./components/AuditForm'));
const ReportGenerator = lazy(() => import('./components/ReportGenerator'));
const QuestionEditor = lazy(() => import('./components/QuestionEditor'));

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Netlify Identity
    netlifyIdentity.init();
    
    // Check for existing user
    const currentUser = netlifyIdentity.currentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    
    // Set up event listeners
    netlifyIdentity.on('login', (user) => {
      setUser(user);
      netlifyIdentity.close();
    });
    
    netlifyIdentity.on('logout', () => {
      setUser(null);
    });
    
    netlifyIdentity.on('error', (err) => {
      console.error('Auth error:', err);
    });
    
    setLoading(false);
    
    return () => {
      netlifyIdentity.off('login');
      netlifyIdentity.off('logout');
    };
  }, []);

  const login = () => {
    netlifyIdentity.open();
  };

  const logout = () => {
    netlifyIdentity.logout();
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Navigation Component
const Navigation = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Audits', icon: <AssignmentIcon />, path: '/audits' },
    { text: 'Templates', icon: <DescriptionIcon />, path: '/templates' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
  ];
  
  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };
  
  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 250 }}>
        <Box sx={{ p: 2, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            Aurora Audit
          </Typography>
          <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
            {user?.email}
          </Typography>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          <ListItem button onClick={logout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();
  const [stats] = useState({
    totalAudits: 24,
    inProgress: 5,
    completed: 19,
    templates: 8
  });
  
  const recentAudits = [
    { id: 1, title: 'Safety Inspection Q1', status: 'In Progress', progress: 65, date: '2025-01-06' },
    { id: 2, title: 'Equipment Check', status: 'Completed', progress: 100, date: '2025-01-05' },
    { id: 3, title: 'Compliance Review', status: 'In Progress', progress: 30, date: '2025-01-04' }
  ];
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.user_metadata?.full_name || user?.email}
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">{stats.totalAudits}</Typography>
            <Typography variant="body2" color="text.secondary">Total Audits</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="warning.main">{stats.inProgress}</Typography>
            <Typography variant="body2" color="text.secondary">In Progress</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="success.main">{stats.completed}</Typography>
            <Typography variant="body2" color="text.secondary">Completed</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="secondary">{stats.templates}</Typography>
            <Typography variant="body2" color="text.secondary">Templates</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent Audits</Typography>
            {recentAudits.map((audit) => (
              <Card key={audit.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6">{audit.title}</Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <Chip 
                          label={audit.status} 
                          color={audit.status === 'Completed' ? 'success' : 'warning'}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {audit.date}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ width: '30%' }}>
                      <Typography variant="body2" color="text.secondary">
                        {audit.progress}% Complete
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={audit.progress}
                        sx={{ mt: 1 }}
                        color={audit.progress === 100 ? 'success' : 'primary'}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                fullWidth
                color="primary"
              >
                New Audit
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                Import Excel
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<PhotoCameraIcon />}
                fullWidth
              >
                Add Photos
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                fullWidth
              >
                Export Report
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Login Page
const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h3" gutterBottom>
            Aurora Audit
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Professional Auditing Platform
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={login}
          startIcon={<PersonIcon />}
        >
          Sign In with Netlify Identity
        </Button>
        
        <Box mt={3} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Secure • Mobile-Optimized • Production Ready
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

// Placeholder components
const AuditsPage = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Audits</Typography>
    <Alert severity="info">Audit management interface coming soon</Alert>
  </Box>
);

const TemplatesPage = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Templates</Typography>
    <Alert severity="info">Template management interface coming soon</Alert>
  </Box>
);

const ReportsPage = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Reports</Typography>
    <Alert severity="info">Report generation interface coming soon</Alert>
  </Box>
);

const SettingsPage = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Settings</Typography>
    <Alert severity="info">Settings configuration coming soon</Alert>
  </Box>
);

// Main App Component
function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: {
            main: '#2196F3',
          },
          secondary: {
            main: '#FF9800',
          }
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        shape: {
          borderRadius: 12
        }
      }),
    [prefersDarkMode]
  );
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Box sx={{ display: 'flex' }}>
                    <AppBar position="fixed">
                      <Toolbar>
                        <IconButton
                          color="inherit"
                          edge="start"
                          onClick={() => setDrawerOpen(true)}
                          sx={{ mr: 2 }}
                        >
                          <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          Aurora Audit Platform
                        </Typography>
                      </Toolbar>
                    </AppBar>
                    <Navigation open={drawerOpen} onClose={() => setDrawerOpen(false)} />
                    <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                      <Container maxWidth="lg">
                        <Suspense fallback={<CircularProgress />}>
                          <Routes>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/audits" element={<AuditsPage />} />
                            <Route path="/templates" element={<TemplatesPage />} />
                            <Route path="/reports" element={<ReportsPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                          </Routes>
                        </Suspense>
                      </Container>
                    </Box>
                    
                    {/* Floating Action Button for mobile */}
                    <Fab
                      color="primary"
                      aria-label="add"
                      sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        display: { xs: 'flex', md: 'none' }
                      }}
                    >
                      <AddIcon />
                    </Fab>
                  </Box>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
