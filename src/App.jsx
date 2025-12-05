import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
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
import UserManagement from './pages/UserManagement';
import Permissions from './pages/Permissions';
import { Loader2, Zap } from 'lucide-react';

// Full-page loading component with brand animation
const FullPageLoader = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-4"
    >
      <motion.div
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amazon-orange to-amazon-orange-dark flex items-center justify-center shadow-lg shadow-amazon-orange/30"
      >
        <Zap size={32} className="text-white" />
      </motion.div>
      <div className="text-center">
        <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
          AuditHub
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
      <motion.div
        className="w-32 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"
      >
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full bg-gradient-to-r from-amazon-orange to-amazon-teal rounded-full"
        />
      </motion.div>
    </motion.div>
  </div>
);

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, hasSelectedStation, loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
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
    return <FullPageLoader />;
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
        <Route path="users" element={<UserManagement />} />
        <Route path="permissions" element={<Permissions />} />
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
        <LanguageProvider>
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
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
