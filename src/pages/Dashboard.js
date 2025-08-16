import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuditList from '../components/AuditList';
import AuditForm from '../components/AuditForm';
import { hasRole } from '../services/auth';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4">Dashboard</Typography>
      {hasRole('admin') || hasRole('auditor') ? <AuditForm /> : null}
      <AuditList />
      <Button onClick={() => navigate('/profile')} variant="outlined">Profile</Button>
    </Box>
  );
};

export default Dashboard;
