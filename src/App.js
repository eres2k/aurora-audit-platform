import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import LoadingScreen from './components/shared/LoadingScreen';
import PrivateRoute from './components/auth/PrivateRoute';

// Lazy load components for better performance
const Login = lazy(() => import('./components/auth/Login'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const AuditList = lazy(() => import('./components/audits/AuditList'));
const AuditDetail = lazy(() => import('./components/audits/AuditDetail'));
const AuditForm = lazy(() => import('./components/audits/AuditForm'));
const QuestionBank = lazy(() => import('./components/questions/QuestionBank'));
const Templates = lazy(() => import('./components/templates/Templates'));
const Reports = lazy(() => import('./components/reports/Reports'));
const Settings = lazy(() => import('./components/settings/Settings'));
const Profile = lazy(() => import('./components/profile/Profile'));
const NotFound = lazy(() => import('./components/shared/NotFound'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <DataProvider>
              <Router>
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={<PrivateRoute />}>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      
                      {/* Audit Routes */}
                      <Route path="audits">
                        <Route index element={<AuditList />} />
                        <Route path="new" element={<AuditForm />} />
                        <Route path=":id" element={<AuditDetail />} />
                        <Route path=":id/edit" element={<AuditForm />} />
                      </Route>
                      
                      {/* Question Routes */}
                      <Route path="questions" element={<QuestionBank />} />
                      
                      {/* Template Routes */}
                      <Route path="templates" element={<Templates />} />
                      
                      {/* Report Routes */}
                      <Route path="reports" element={<Reports />} />
                      
                      {/* User Routes */}
                      <Route path="profile" element={<Profile />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>
                    
                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Router>
            </DataProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;