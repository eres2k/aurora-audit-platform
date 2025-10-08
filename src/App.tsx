import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { AuthProvider } from './contexts/AuthContext';
import { AuditProvider } from './contexts/AuditContext';
import { theme } from './theme';
import Login from './components/Login';
import AuditList from './components/AuditList';
import AuditForm from './components/AuditForm';
import QuestionEditor from './components/QuestionEditor';
import TemplateManager from './components/TemplateManager';
import { useAuth } from './hooks/useAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
});

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function AppShell() {
  const { user, login, logout } = useAuth();

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Safety Culture Audit Platform
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Audits
          </Button>
          <Button color="inherit" component={Link} to="/questions">
            Questions
          </Button>
          <Button color="inherit" component={Link} to="/templates">
            Templates
          </Button>
          {user ? (
            <Button color="inherit" onClick={logout} data-testid="appbar-logout">
              Sign out
            </Button>
          ) : (
            <Button color="inherit" onClick={login} data-testid="appbar-login">
              Sign in
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<AuditList />} />
          <Route path="/audits/:id" element={<AuditForm />} />
          <Route path="/questions" element={<QuestionEditor />} />
          <Route path="/templates" element={<TemplateManager />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <AuditProvider>
              <AppShell />
            </AuditProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
