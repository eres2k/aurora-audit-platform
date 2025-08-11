import React, { createContext, useState, useContext } from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success', 'error', 'warning', 'info'
    title: '',
    duration: 6000
  });

  const showNotification = (message, severity = 'info', title = '', duration = 6000) => {
    setNotification({
      open: true,
      message,
      severity,
      title,
      duration
    });
  };

  const showSuccess = (message, title = 'Success') => {
    showNotification(message, 'success', title);
  };

  const showError = (message, title = 'Error') => {
    showNotification(message, 'error', title);
  };

  const showWarning = (message, title = 'Warning') => {
    showNotification(message, 'warning', title);
  };

  const showInfo = (message, title = 'Info') => {
    showNotification(message, 'info', title);
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider value={{
      showNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      hideNotification
    }}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.duration}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={hideNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {notification.title && <AlertTitle>{notification.title}</AlertTitle>}
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;