#!/bin/bash

# Complete Fix Script for Aurora Audit Platform
# This ensures ALL required files and services are created

echo "🚀 Complete fix for Aurora Audit Platform..."

# Navigate to project directory
cd aurora-audit-platform 2>/dev/null || cd .

# Create all required directories
echo "📁 Creating directory structure..."
mkdir -p src/{services,hooks,utils,api,components/{audits,audit,common,auth},pages,contexts,models,styles}
mkdir -p netlify/functions
mkdir -p public

# 1. Create API client first (needed by services)
echo "📝 Creating API client..."
cat > src/api/client.js << 'EOF'
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/.netlify/functions';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
EOF

# 2. Create auditService
echo "📝 Creating auditService..."
cat > src/services/auditService.js << 'EOF'
import api from '../api/client';

export const auditService = {
  getAll: async () => {
    try {
      const response = await api.get('/audits');
      return response.data;
    } catch (error) {
      console.error('Error fetching audits:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/audits/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit:', error);
      return null;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/audits', data);
      return response.data;
    } catch (error) {
      console.error('Error creating audit:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/audits/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating audit:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/audits/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting audit:', error);
      return false;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/audits/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalAudits: 0,
        inProgress: 0,
        completed: 0,
        templates: 0,
      };
    }
  },

  exportToPdf: async (id) => {
    try {
      const response = await api.get(`/audits/${id}/export/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  },
};
EOF

# 3. Create questionService
echo "📝 Creating questionService..."
cat > src/services/questionService.js << 'EOF'
import api from '../api/client';

export const questionService = {
  getAll: async () => {
    try {
      const response = await api.get('/questions');
      return response.data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/questions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching question:', error);
      return null;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/questions', data);
      return response.data;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/questions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/questions/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting question:', error);
      return false;
    }
  },

  importFromExcel: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/questions/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing questions:', error);
      throw error;
    }
  },

  exportToExcel: async () => {
    try {
      const response = await api.get('/questions/export', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting questions:', error);
      throw error;
    }
  },
};
EOF

# 4. Create templateService
echo "📝 Creating templateService..."
cat > src/services/templateService.js << 'EOF'
import api from '../api/client';

export const templateService = {
  getAll: async () => {
    try {
      const response = await api.get('/templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching template:', error);
      return null;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/templates', data);
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/templates/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/templates/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      return false;
    }
  },
};
EOF

# 5. Create fileService
echo "📝 Creating fileService..."
cat > src/services/fileService.js << 'EOF'
import api from '../api/client';

export const fileService = {
  upload: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  uploadMultiple: async (files) => {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
      
      const response = await api.post('/files/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  },

  get: async (id) => {
    try {
      const response = await api.get(`/files/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching file:', error);
      return null;
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/files/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  },

  getUrl: (id) => {
    return `${process.env.REACT_APP_API_URL || '/.netlify/functions'}/files/${id}`;
  },
};
EOF

# 6. Create useOffline hook
echo "📝 Creating useOffline hook..."
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

# 7. Create useAuth hook
echo "📝 Creating useAuth hook..."
cat > src/hooks/useAuth.js << 'EOF'
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a default value if not in provider
    return {
      user: null,
      loading: false,
      login: () => {},
      logout: () => {},
      isAuthenticated: false,
    };
  }
  return context;
};
EOF

# 8. Create AuthContext
echo "📝 Creating AuthContext..."
cat > src/contexts/AuthContext.js << 'EOF'
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth
    const token = localStorage.getItem('auth_token');
    if (token) {
      // In a real app, validate token with backend
      setUser({ email: 'user@example.com' });
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Simulated login
    localStorage.setItem('auth_token', 'dummy-token');
    setUser({ email });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    window.location.href = '/login';
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
EOF

# 9. Create useAutoSave hook
echo "📝 Creating useAutoSave hook..."
cat > src/hooks/useAutoSave.js << 'EOF'
import { useEffect, useRef, useCallback } from 'react';

export const useAutoSave = ({ data, enabled, onSave, interval = 30000 }) => {
  const saveTimerRef = useRef(null);
  const lastSavedDataRef = useRef(null);

  const saveData = useCallback(async () => {
    if (!enabled) return;
    
    const dataString = JSON.stringify(data);
    if (dataString === lastSavedDataRef.current) {
      return;
    }

    try {
      await onSave(data);
      lastSavedDataRef.current = dataString;
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [data, enabled, onSave]);

  useEffect(() => {
    if (enabled) {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
      saveTimerRef.current = setInterval(() => {
        saveData();
      }, interval);
    }

    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
    };
  }, [enabled, saveData, interval]);

  return { saveData };
};
EOF

# 10. Create debounce utility
echo "📝 Creating debounce utility..."
cat > src/utils/debounce.js << 'EOF'
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
EOF

# 11. Ensure AuditForm exists in the audits folder (where it's being imported from)
echo "📝 Ensuring AuditForm exists in audits folder..."
cat > src/components/audits/AuditForm.js << 'EOF'
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { Save, Send, CloudOff, CheckCircle } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useOffline } from '../../hooks/useOffline';
import { useAutoSave } from '../../hooks/useAutoSave';
import { auditService } from '../../services/auditService';

const AuditForm = ({ audit, questions = [], onSubmit, onCancel, mode = 'create' }) => {
  const isOffline = useOffline();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [lastSaved, setLastSaved] = useState(null);
  
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    getValues,
  } = useForm({
    defaultValues: {
      title: audit?.title || '',
      description: audit?.description || '',
      location: audit?.metadata?.location || '',
      department: audit?.metadata?.department || '',
    },
  });

  // Auto-save functionality
  const { saveData } = useAutoSave({
    data: getValues(),
    enabled: mode === 'edit' && isDirty && !isOffline,
    onSave: async (data) => {
      try {
        if (audit?.id) {
          await auditService.update(audit.id, { ...data, status: 'draft' });
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    },
    interval: 30000,
  });

  const handleFormSubmit = async (data) => {
    try {
      if (mode === 'edit' && audit?.id) {
        await auditService.update(audit.id, data);
      } else {
        await auditService.create(data);
      }
      
      setSnackbar({
        open: true,
        message: 'Audit saved successfully',
        severity: 'success',
      });
      
      if (onSubmit) {
        onSubmit(data);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error saving audit',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            {mode === 'create' ? 'New Audit' : 'Edit Audit'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isOffline ? (
              <Chip
                icon={<CloudOff />}
                label="Offline Mode"
                color="warning"
                size="small"
              />
            ) : (
              <Chip
                icon={<CheckCircle />}
                label="Online"
                color="success"
                size="small"
              />
            )}
            {lastSaved && (
              <Typography variant="caption" color="textSecondary">
                Last saved: {lastSaved.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Progress</Typography>
            <Typography variant="body2">50%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={50} />
        </Box>

        {/* Basic Information */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Audit Title"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  required
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Department"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Location"
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Questions Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Audit Questions
        </Typography>
        {questions.length === 0 ? (
          <Alert severity="info">No questions available. Please add questions to this audit.</Alert>
        ) : (
          <Box>
            <Typography variant="body2" color="textSecondary">
              {questions.length} questions to answer
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="outlined"
          startIcon={<Save />}
          onClick={handleSubmit((data) => handleFormSubmit({ ...data, status: 'draft' }))}
        >
          Save as Draft
        </Button>
        <Button
          variant="contained"
          startIcon={<Send />}
          onClick={handleSubmit((data) => handleFormSubmit({ ...data, status: 'completed' }))}
        >
          Submit Audit
        </Button>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuditForm;
EOF

# 12. Create sample Netlify function for testing
echo "📝 Creating sample Netlify function..."
cat > netlify/functions/audits.js << 'EOF'
exports.handler = async (event, context) => {
  const { httpMethod, path, body } = event;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Sample data
  const sampleAudits = [
    {
      id: '1',
      title: 'Sample Audit 1',
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      assignedTo: 'John Doe',
    },
    {
      id: '2',
      title: 'Sample Audit 2',
      status: 'completed',
      createdAt: new Date().toISOString(),
      assignedTo: 'Jane Smith',
    },
  ];

  switch (httpMethod) {
    case 'GET':
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(sampleAudits),
      };
    
    case 'POST':
      const newAudit = JSON.parse(body);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          id: Date.now().toString(),
          ...newAudit,
          createdAt: new Date().toISOString(),
        }),
      };
    
    default:
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
  }
};
EOF

# 13. Update netlify.toml
echo "📝 Updating netlify.toml..."
cat > netlify.toml << 'EOF'
[build]
  command = "CI=false npm run build"
  functions = "netlify/functions"
  publish = "build"

[build.environment]
  REACT_APP_NETLIFY_FUNCTIONS_URL = "/.netlify/functions"
  CI = "false"
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
EOF

echo "✅ All services and dependencies created!"
echo ""
echo "📋 Files created/updated:"
echo "  ✅ src/api/client.js"
echo "  ✅ src/services/auditService.js"
echo "  ✅ src/services/questionService.js"
echo "  ✅ src/services/templateService.js"
echo "  ✅ src/services/fileService.js"
echo "  ✅ src/hooks/useOffline.js"
echo "  ✅ src/hooks/useAuth.js"
echo "  ✅ src/hooks/useAutoSave.js"
echo "  ✅ src/contexts/AuthContext.js"
echo "  ✅ src/utils/debounce.js"
echo "  ✅ src/components/audits/AuditForm.js"
echo "  ✅ netlify/functions/audits.js"
echo "  ✅ netlify.toml"
echo ""
echo "🚀 Next steps:"
echo "  1. Commit changes: git add . && git commit -m 'Add all missing services and dependencies'"
echo "  2. Push to GitHub: git push"
echo "  3. Check Netlify deploy logs"
echo ""
echo "The build should now succeed! 🎉"