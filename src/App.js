<<<<<<< HEAD
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, CssBaseline } from '@mui/material';
import { getUser } from './services/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuditDetail from './pages/AuditDetail';
import Profile from './pages/Profile';
=======
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import StationSelect from './pages/StationSelect';
import AuditPage from './pages/AuditPage';
import DashboardPage from './pages/DashboardPage';
import { useAuth } from './contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="p-4">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};
>>>>>>> 4c499ac7348d567bfcbfa9340512d947eefef623

function App() {
  const user = getUser();

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.REACT_APP_ENABLE_OFFLINE === 'true') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register('sync-audits');
      });
    }
  }, []);

  return (
<<<<<<< HEAD
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/audit/:id" element={user ? <AuditDetail /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </Container>
    </>
=======
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/station"
        element={
          <PrivateRoute>
            <StationSelect />
          </PrivateRoute>
        }
      />
      <Route
        path="/audit/:id?"
        element={
          <PrivateRoute>
            <AuditPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/station" replace />} />
    </Routes>
>>>>>>> 4c499ac7348d567bfcbfa9340512d947eefef623
  );
}

export default App;
