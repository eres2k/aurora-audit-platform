import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { login } = useAuth();
  return (
    <Container sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Sign In
      </Typography>
      <Button variant="contained" onClick={login}>
        Login with Netlify
      </Button>
    </Container>
  );
}
