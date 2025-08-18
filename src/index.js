import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
<<<<<<< HEAD
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { BrowserRouter } from 'react-router-dom';
import netlifyIdentity from 'netlify-identity-widget';

netlifyIdentity.init({ container: '#netlify-modal' });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>
);

if ('serviceWorker' in navigator && process.env.REACT_APP_ENABLE_PWA === 'true') {
=======
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
>>>>>>> 4c499ac7348d567bfcbfa9340512d947eefef623
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
