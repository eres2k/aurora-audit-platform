import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { login, signup } from '../services/auth';

const Login = () => (
  <Box sx={{ textAlign: 'center', mt: 8 }}>
    <Typography variant="h4">Aurora Audit Platform</Typography>
    <Box sx={{ mt: 4 }}>
      <Button onClick={login} variant="contained" sx={{ mr: 2 }}>Login</Button>
      <Button onClick={signup} variant="outlined">Sign Up</Button>
    </Box>
  </Box>
);

export default Login;
