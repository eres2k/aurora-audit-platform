import React, { useEffect, useState } from 'react';
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
import { UserProvider } from './contexts/UserContext';
import { theme } from './theme';
import { Toaster } from './components/common/Toaster';
import { NavBar } from './components/common/NavBar';
import Login from './components/Login';
import AuditList from './components/AuditList';
import AuditForm from './components/AuditForm';
import QuestionEditor from './components/QuestionEditor';
import TemplateManager from './components/TemplateManager';
import { initIdentity, getCurrentUser } from './services/netlifyIdentity';

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

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    initIdentity();
    setUser(getCurrentUser());
    // Register service worker for PWA/offline
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
              <UserProvider value={{ user, setUser }}>
                <AppBar position="static">
                  <Toolbar>
                    <Typography variant="h6">Aurora Audit Platform</Typography>
                    <Button color="inherit" component={Link} to="/">Audits</Button>
                    <Button color="inherit" component={Link} to="/questions">Questions</Button>
                    <Button color="inherit" component={Link} to="/templates">Templates</Button>
                    <Button color="inherit" component={Link} to="/login">Login</Button>
                  </Toolbar>
                </AppBar>
                <main style={{ padding: 16 }}>
                  <Routes>
                    <Route path="/" element={<AuditList />} />
                    <Route path="/audits/new" element={<AuditForm />} />
                    <Route path="/audits/:id" element={<AuditForm />} />
                    <Route path="/questions" element={<QuestionEditor />} />
                    <Route path="/templates" element={<TemplateManager />} />
                    <Route path="/login" element={<Login />} />
                  </Routes>
                </main>
              </UserProvider>
            </AuditProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
