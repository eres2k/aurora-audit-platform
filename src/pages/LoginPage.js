import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '100px auto' }}>
      <h2>Aurora Audit Platform</h2>
      <p>Professional Auditing System</p>
      <button onClick={login} style={{ padding: '10px 20px', marginTop: '20px' }}>
        Sign In
      </button>
    </div>
  );
};

export default LoginPage;
