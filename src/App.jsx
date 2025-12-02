import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuditProvider } from './context/AuditContext';
import { Layout } from './components/layout';
import LoginPage from './components/LoginPage';
import StationSelector from './components/StationSelector';
import Dashboard from './pages/Dashboard';
import Audits from './pages/Audits';
import NewAudit from './pages/NewAudit';
import AuditDetail from './pages/AuditDetail';
import Templates from './pages/Templates';
import Actions from './pages/Actions';
import Analytics from './pages/Analytics';
import Team from './pages/Team';
import Settings from './pages/Settings';
import { Loader2 } from 'lucide-react';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, hasSelectedStation, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amazon-orange animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasSelectedStation) {
    return <StationSelector />;
  }

  return children;
}

// App Routes
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amazon-orange animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="audits" element={<Audits />} />
        <Route path="audits/new" element={<NewAudit />} />
        <Route path="audits/:id" element={<AuditDetail />} />
        <Route path="audits/:id/continue" element={<NewAudit />} />
        <Route path="templates" element={<Templates />} />
        <Route path="templates/:id" element={<Templates />} />
        <Route path="actions" element={<Actions />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="team" element={<Team />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// Main App Component
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AuditProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                className: 'font-body',
                duration: 3000,
                style: {
                  background: '#1e293b',
                  color: '#f8fafc',
                  borderRadius: '12px',
                  padding: '12px 16px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#f8fafc',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#f8fafc',
                  },
                },
              }}
            />
            <AppRoutes />
          </AuditProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
