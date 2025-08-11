import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth
    const token = localStorage.getItem('auth_token');
    if (token) {
      setUser({ email: 'user@example.com' });
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    localStorage.setItem('auth_token', 'dummy-token');
    setUser({ email });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
