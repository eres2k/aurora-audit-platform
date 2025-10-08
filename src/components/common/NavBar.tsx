import React from 'react';
import { AppBar, Toolbar, Typography, Button, Stack, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function NavBar() {
  const { user, login, logout } = useAuth();

  return (
    <AppBar position="sticky" elevation={0} color="transparent" sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ py: 1.5 }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'primary.main',
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          Safety Culture Audits
        </Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button color="inherit" component={Link} to="/audits">
            Audits
          </Button>
          <Button color="inherit" component={Link} to="/questions">
            Questions
          </Button>
          <Button color="inherit" component={Link} to="/templates">
            Templates
          </Button>
          {user?.email && (
            <Chip label={user.email} size="small" color="default" sx={{ bgcolor: 'rgba(4,99,128,0.12)' }} />
          )}
          {user ? (
            <Button variant="contained" color="primary" onClick={logout}>
              Log out
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={login}>
              Sign in
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
