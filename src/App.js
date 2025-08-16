import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, CssBaseline } from '@mui/material';
import { getUser } from './services/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuditDetail from './pages/AuditDetail';
import Profile from './pages/Profile';

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
  );
}

export default App;
