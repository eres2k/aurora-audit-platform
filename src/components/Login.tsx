import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login, user } = useAuth();

  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderRadius: 3,
        boxShadow: '0 18px 40px rgba(4, 99, 128, 0.08)',
        p: { xs: 3, md: 6 },
        textAlign: 'center',
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Typography variant="h4" color="primary.main" fontWeight={700}>
          Sign in to Safety Culture Audits
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={420}>
          Access your audits, templates, and question banks securely with Netlify Identity. Your
          findings are stored in Netlify Blobs and synced across devices.
        </Typography>
        {user ? (
          <Typography variant="body1" color="success.main">
            You are already signed in as {user.email}.
          </Typography>
        ) : (
          <Button variant="contained" size="large" onClick={login}>
            Continue with Netlify Identity
          </Button>
        )}
      </Stack>
    </Box>
  );
}
