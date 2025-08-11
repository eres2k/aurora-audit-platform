import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: '240px', background: '#f5f5f5', padding: '20px' }}>
        <h3>Aurora Audit</h3>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: '#333' }}>Dashboard</Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/audits" style={{ textDecoration: 'none', color: '#333' }}>Audits</Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/questions" style={{ textDecoration: 'none', color: '#333' }}>Questions</Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/templates" style={{ textDecoration: 'none', color: '#333' }}>Templates</Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/reports" style={{ textDecoration: 'none', color: '#333' }}>Reports</Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/settings" style={{ textDecoration: 'none', color: '#333' }}>Settings</Link>
          </li>
        </ul>
        <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button>
      </nav>
      <main style={{ flex: 1, padding: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          {user && <span>Logged in as: {user.email}</span>}
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
