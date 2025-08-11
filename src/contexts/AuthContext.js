import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for existing auth
    const token = localStorage.getItem('auth_token');
    if (token) {
      setUser({ email: 'user@example.com' });
    }
    setLoading(false);
  }, []);

  const login = () => {
    localStorage.setItem('auth_token', 'dummy-token');
    setUser({ email: 'user@example.com' });
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

// EXPORT useAuth FROM HERE TOO
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      loading: false,
      login: () => {},
      logout: () => {},
      isAuthenticated: false,
    };
  }
  return context;
};
