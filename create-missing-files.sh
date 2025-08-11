#!/bin/bash

# Aurora Audit Platform - Complete Project Setup Script
# This script creates all necessary files and folders for the platform

echo "🚀 Setting up Aurora Audit Platform..."

# Create main project directory
PROJECT_NAME="aurora-audit-platform"
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# Initialize package.json
cat > package.json << 'EOF'
{
  "name": "aurora-audit-platform",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.8.0",
    "@mui/material": "^7.3.1",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@react-pdf/renderer": "^4.3.0",
    "xlsx": "^0.18.5",
    "netlify-identity-widget": "^1.9.2",
    "axios": "^1.6.0",
    "date-fns": "^3.0.0",
    "react-dropzone": "^14.2.0",
    "recharts": "^2.10.0",
    "react-hook-form": "^7.48.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint src/**/*.{js,jsx}"
  },
  "devDependencies": {
    "react-scripts": "5.0.1",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.0.0",
    "eslint": "^8.50.0",
    "prettier": "^3.0.0"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

# Create public directory and files
mkdir -p public
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Aurora Audit Platform - Professional Auditing System" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Aurora Audit Platform</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOF

cat > public/manifest.json << 'EOF'
{
  "short_name": "Aurora Audit",
  "name": "Aurora Audit Platform",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
EOF

# Create src directory structure
mkdir -p src/{components,pages,services,hooks,utils,contexts,models,styles,constants,api}
mkdir -p src/components/{common,audit,questions,templates,reports,auth}

# Create main App files
cat > src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import theme from './styles/theme';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
EOF

cat > src/App.js << 'EOF'
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import Layout from './components/common/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AuditsPage from './pages/AuditsPage';
import AuditDetailPage from './pages/AuditDetailPage';
import QuestionsPage from './pages/QuestionsPage';
import TemplatesPage from './pages/TemplatesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Box>Loading...</Box>;
  }

  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="audits" element={<AuditsPage />} />
          <Route path="audits/:id" element={<AuditDetailPage />} />
          <Route path="questions" element={<QuestionsPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
EOF

# Create Authentication Context
cat > src/contexts/AuthContext.js << 'EOF'
import React, { createContext, useState, useEffect, useContext } from 'react';
import netlifyIdentity from 'netlify-identity-widget';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    netlifyIdentity.init();
    
    const currentUser = netlifyIdentity.currentUser();
    setUser(currentUser);
    setLoading(false);

    netlifyIdentity.on('login', (user) => {
      setUser(user);
      netlifyIdentity.close();
    });

    netlifyIdentity.on('logout', () => {
      setUser(null);
    });

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
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
EOF

# Create Pages
cat > src/pages/LoginPage.js << 'EOF'
import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" gutterBottom align="center">
          Aurora Audit Platform
        </Typography>
        <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
          Professional Auditing System
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={login}
        >
          Sign In with Netlify
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;
EOF

cat > src/pages/DashboardPage.js << 'EOF'
import React from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/auditService';

const DashboardPage = () => {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: auditService.getStats,
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Audits
              </Typography>
              <Typography variant="h5">
                {stats?.totalAudits || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h5">
                {stats?.inProgress || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h5">
                {stats?.completed || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Templates
              </Typography>
              <Typography variant="h5">
                {stats?.templates || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {/* Activity list will go here */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
EOF

cat > src/pages/AuditsPage.js << 'EOF'
import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditService } from '../services/auditService';
import CreateAuditDialog from '../components/audit/CreateAuditDialog';

const AuditsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: audits, isLoading } = useQuery({
    queryKey: ['audits'],
    queryFn: auditService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: auditService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['audits']);
    },
  });

  const handleView = (id) => {
    navigate(`/audits/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this audit?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      in_progress: 'primary',
      completed: 'success',
      archived: 'warning',
    };
    return colors[status] || 'default';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Audits</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Audit
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {audits?.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell>{audit.title}</TableCell>
                <TableCell>
                  <Chip
                    label={audit.status}
                    color={getStatusColor(audit.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(audit.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{audit.assignedTo}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleView(audit.id)}>
                    <Visibility />
                  </IconButton>
                  <IconButton onClick={() => handleView(audit.id)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(audit.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <CreateAuditDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </Box>
  );
};

export default AuditsPage;
EOF

# Create Services
cat > src/services/auditService.js << 'EOF'
import api from '../api/client';

export const auditService = {
  getAll: async () => {
    const response = await api.get('/audits');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/audits/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/audits', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/audits/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/audits/${id}`);
  },

  getStats: async () => {
    const response = await api.get('/audits/stats');
    return response.data;
  },

  exportToPdf: async (id) => {
    const response = await api.get(`/audits/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
EOF

cat > src/services/questionService.js << 'EOF'
import api from '../api/client';

export const questionService = {
  getAll: async () => {
    const response = await api.get('/questions');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/questions', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/questions/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/questions/${id}`);
  },

  importFromExcel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/questions/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  exportToExcel: async () => {
    const response = await api.get('/questions/export', {
      responseType: 'blob',
    });
    return response.data;
  },
};
EOF

# Create API client
cat > src/api/client.js << 'EOF'
import axios from 'axios';
import netlifyIdentity from 'netlify-identity-widget';

const API_URL = process.env.REACT_APP_API_URL || '/.netlify/functions';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
client.interceptors.request.use(
  (config) => {
    const user = netlifyIdentity.currentUser();
    if (user?.token?.access_token) {
      config.headers.Authorization = `Bearer ${user.token.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      netlifyIdentity.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
EOF

# Create Common Components
cat > src/components/common/Layout.js << 'EOF'
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Assignment,
  QuestionAnswer,
  Description,
  Assessment,
  Settings,
  Logout,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const drawerWidth = 240;

const Layout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Audits', icon: <Assignment />, path: '/audits' },
    { text: 'Questions', icon: <QuestionAnswer />, path: '/questions' },
    { text: 'Templates', icon: <Description />, path: '/templates' },
    { text: 'Reports', icon: <Assessment />, path: '/reports' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Aurora Audit
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={logout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.email}
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
EOF

# Create Audit Components
cat > src/components/audit/CreateAuditDialog.js << 'EOF'
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { auditService } from '../../services/auditService';
import { templateService } from '../../services/templateService';

const CreateAuditDialog = ({ open, onClose }) => {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset } = useForm();
  
  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: templateService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: auditService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['audits']);
      reset();
      onClose();
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Create New Audit</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Controller
              name="title"
              control={control}
              defaultValue=""
              rules={{ required: 'Title is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Audit Title"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            
            <Controller
              name="description"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            />
            
            <Controller
              name="templateId"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Template</InputLabel>
                  <Select {...field} label="Template">
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {templates?.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            
            <Controller
              name="location"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField {...field} label="Location" fullWidth />
              )}
            />
            
            <Controller
              name="department"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField {...field} label="Department" fullWidth />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={createMutation.isLoading}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateAuditDialog;
EOF

# Create utils
cat > src/utils/pdfGenerator.js << 'EOF'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    fontSize: 10,
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
  },
});

export const AuditPDFDocument = ({ audit }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Audit Report</Text>
      <View style={styles.section}>
        <Text style={styles.title}>{audit.title}</Text>
        <Text style={styles.text}>Status: {audit.status}</Text>
        <Text style={styles.text}>Created: {new Date(audit.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.text}>Location: {audit.metadata?.location}</Text>
        <Text style={styles.text}>Department: {audit.metadata?.department}</Text>
      </View>
      
      {audit.responses?.map((response, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.text}>
            Q{index + 1}: {response.question}
          </Text>
          <Text style={styles.text}>
            Answer: {response.answer}
          </Text>
        </View>
      ))}
      
      <Text style={styles.footer}>
        Generated on {new Date().toLocaleDateString()} - Aurora Audit Platform
      </Text>
    </Page>
  </Document>
);

export const generatePDF = async (audit) => {
  // This function would be called to generate PDF
  return <AuditPDFDocument audit={audit} />;
};
EOF

cat > src/utils/excelHandler.js << 'EOF'
import * as XLSX from 'xlsx';

export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Transform Excel data to question format
        const questions = jsonData.map((row) => ({
          text: row['Question'] || row['Text'],
          type: row['Type'] || 'text',
          category: row['Category'] || 'General',
          required: row['Required'] === 'Yes' || row['Required'] === true,
          options: row['Options'] ? row['Options'].split(',').map(o => o.trim()) : [],
          order: row['Order'] || 0,
        }));
        
        resolve(questions);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const exportToExcel = (data, filename = 'export.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, filename);
};

export const createExcelTemplate = () => {
  const template = [
    {
      Question: 'Sample Question 1',
      Type: 'text',
      Category: 'General',
      Required: 'Yes',
      Options: '',
      Order: 1,
    },
    {
      Question: 'Sample Question 2',
      Type: 'select',
      Category: 'Safety',
      Required: 'No',
      Options: 'Option1, Option2, Option3',
      Order: 2,
    },
  ];
  
  exportToExcel(template, 'question_template.xlsx');
};
EOF

# Create hooks
cat > src/hooks/useAuth.js << 'EOF'
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
EOF

cat > src/hooks/useOffline.js << 'EOF'
import { useState, useEffect } from 'react';

export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
};
EOF

# Create styles
cat > src/styles/theme.js << 'EOF'
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export default theme;
EOF

cat > src/styles/index.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

#root {
  min-height: 100vh;
}
EOF

# Create environment file
cat > .env.example << 'EOF'
# Netlify Identity
REACT_APP_NETLIFY_IDENTITY_URL=https://your-site.netlify.app

# API Configuration
REACT_APP_API_URL=/.netlify/functions

# Database (Supabase/Firebase)
REACT_APP_DATABASE_URL=
REACT_APP_DATABASE_KEY=

# Storage
REACT_APP_STORAGE_BUCKET=
REACT_APP_STORAGE_KEY=

# Feature Flags
REACT_APP_ENABLE_OFFLINE=true
REACT_APP_ENABLE_PWA=true
REACT_APP_MAX_FILE_SIZE=10485760
EOF

# Create Netlify configuration
cat > netlify.toml << 'EOF'
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "build"

[build.environment]
  REACT_APP_NETLIFY_FUNCTIONS_URL = "/.netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production]
  environment = { NODE_ENV = "production" }

[context.deploy-preview]
  environment = { NODE_ENV = "development" }

[context.branch-deploy]
  environment = { NODE_ENV = "development" }
EOF

# Create Netlify Functions directory
mkdir -p netlify/functions

# Create sample Netlify function
cat > netlify/functions/audits.js << 'EOF'
exports.handler = async (event, context) => {
  // Check authentication
  const { user } = context.clientContext;
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const { httpMethod, path, body } = event;

  // Handle different HTTP methods
  switch (httpMethod) {
    case 'GET':
      return {
        statusCode: 200,
        body: JSON.stringify({
          audits: [],
          message: 'Audits retrieved successfully',
        }),
      };
    
    case 'POST':
      const data = JSON.parse(body);
      return {
        statusCode: 201,
        body: JSON.stringify({
          audit: { id: Date.now().toString(), ...data },
          message: 'Audit created successfully',
        }),
      };
    
    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
  }
};
EOF

# Create additional service files
cat > src/services/templateService.js << 'EOF'
import api from '../api/client';

export const templateService = {
  getAll: async () => {
    const response = await api.get('/templates');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/templates', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/templates/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/templates/${id}`);
  },
};
EOF

# Create remaining page files
cat > src/pages/AuditDetailPage.js << 'EOF'
import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/auditService';

const AuditDetailPage = () => {
  const { id } = useParams();
  
  const { data: audit, isLoading } = useQuery({
    queryKey: ['audit', id],
    queryFn: () => auditService.getById(id),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {audit?.title}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Details will be implemented here</Typography>
      </Paper>
    </Box>
  );
};

export default AuditDetailPage;
EOF

cat > src/pages/QuestionsPage.js << 'EOF'
import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Upload, Download } from '@mui/icons-material';
import { questionService } from '../services/questionService';
import { importFromExcel, createExcelTemplate } from '../utils/excelHandler';

const QuestionsPage = () => {
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const questions = await importFromExcel(file);
        console.log('Imported questions:', questions);
        // Handle imported questions
      } catch (error) {
        console.error('Import error:', error);
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Questions</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={createExcelTemplate}
          >
            Download Template
          </Button>
          <Button
            variant="contained"
            component="label"
            startIcon={<Upload />}
          >
            Import Excel
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleImport}
            />
          </Button>
        </Box>
      </Box>
      <Paper sx={{ p: 3 }}>
        <Typography>Question management interface will be implemented here</Typography>
      </Paper>
    </Box>
  );
};

export default QuestionsPage;
EOF

cat > src/pages/TemplatesPage.js << 'EOF'
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const TemplatesPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Templates
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Template management will be implemented here</Typography>
      </Paper>
    </Box>
  );
};

export default TemplatesPage;
EOF

cat > src/pages/ReportsPage.js << 'EOF'
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ReportsPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Reporting interface will be implemented here</Typography>
      </Paper>
    </Box>
  );
};

export default ReportsPage;
EOF

cat > src/pages/SettingsPage.js << 'EOF'
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const SettingsPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Settings interface will be implemented here</Typography>
      </Paper>
    </Box>
  );
};

export default SettingsPage;
EOF

# Create PrivateRoute component
cat > src/components/auth/PrivateRoute.js << 'EOF'
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
EOF

# Create README
cat > README.md << 'EOF'
# Aurora Audit Platform

Professional auditing system with multi-user support, persistent storage, and comprehensive reporting.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

4. Deploy to Netlify:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

## Features

- Multi-user authentication with Netlify Identity
- Comprehensive audit management
- Dynamic question editor
- Excel import/export
- Professional PDF reports
- Photo attachments
- Mobile optimization
- Offline support

## Development

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
aurora-audit-platform/
├── public/
├── src/
│   ├── api/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── utils/
├── netlify/
│   └── functions/
├── .env.example
├── netlify.toml
├── package.json
└── README.md
```

## License

MIT
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Editor directories
.idea
.vscode
*.swp
*.swo
*~

# Netlify
.netlify

# Local Netlify folder
.netlify
EOF

echo "✅ Aurora Audit Platform setup complete!"
echo ""
echo "Next steps:"
echo "1. cd $PROJECT_NAME"
echo "2. npm install"
echo "3. cp .env.example .env"
echo "4. Configure your environment variables"
echo "5. npm start"
echo ""
echo "To deploy to Netlify:"
echo "1. netlify login"
echo "2. netlify init"
echo "3. netlify deploy --prod"
echo ""
echo "📚 Check README.md for more information"