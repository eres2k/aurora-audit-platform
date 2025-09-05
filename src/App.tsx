import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { AuditProvider } from './contexts/AuditContext';
import { AppRouter } from './routes/AppRouter';
import { theme } from './theme';
import { Toaster } from './components/common/Toaster';
import { NavBar } from './components/common/NavBar';
import Login from './components/Login';
import AuditList from './components/AuditList';
import { initIdentity, getCurrentUser } from './services/netlifyIdentity';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
});

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    initIdentity();
    setUser(getCurrentUser());
    // subscribe to identity events if needed
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <AuditProvider>
              <NavBar />
              <div>
                <header>
                  <h1>Aurora Audit Platform</h1>
                  <nav>
                    <Link to="/">Audits</Link> | <Link to="/login">Login</Link>
                  </nav>
                </header>

                <main>
                  <Routes>
                    <Route path="/" element={<AuditList user={user} />} />
                    <Route path="/login" element={<Login />} />
                  </Routes>
                </main>
              </div>
              <Toaster />
            </AuditProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
