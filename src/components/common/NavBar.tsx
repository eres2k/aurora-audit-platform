import React from 'react';
import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function NavBar() {
  const { user, login, logout } = useAuth();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          Aurora Audit
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button color="inherit" component={Link} to="/audits">
            Audits
          </Button>
          <Button color="inherit" component={Link} to="/questions">
            Questions
          </Button>
          <Button color="inherit" component={Link} to="/templates">
            Templates
          </Button>
          {user ? (
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" onClick={login}>
              Login
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
