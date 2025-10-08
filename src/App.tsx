import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/common/Toaster';
import { NavBar } from './components/common/NavBar';
import Login from './components/Login';
import AuditList from './components/AuditList';
import AuditForm from './components/AuditForm';
import QuestionEditor from './components/QuestionEditor';
import TemplateManager from './components/TemplateManager';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#046380',
    },
    secondary: {
      main: '#f9a03f',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
});

function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <NavBar />
          <Box component="main" sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: { xs: 3, md: 6 } }}>
            <Container maxWidth="lg">
              <Routes>
                <Route path="/" element={<Navigate to="/audits" replace />} />
                <Route path="/audits" element={<AuditList />} />
                <Route path="/audits/new" element={<AuditForm />} />
                <Route path="/audits/:id" element={<AuditForm />} />
                <Route path="/questions" element={<QuestionEditor />} />
                <Route path="/templates" element={<TemplateManager />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/audits" replace />} />
              </Routes>
            </Container>
          </Box>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
