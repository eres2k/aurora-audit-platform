// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import netlifyIdentity from 'netlify-identity-widget';

// Create context without a default value so missing providers are detected
const AuthContext = createContext(undefined);

// Configure Netlify Identity
netlifyIdentity.init({
  APIUrl: process.env.REACT_APP_NETLIFY_IDENTITY_URL
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing user on mount
    const currentUser = netlifyIdentity.currentUser();
    setUser(currentUser);
    setLoading(false);

    // Set up event listeners
    netlifyIdentity.on('login', (user) => {
      setUser(user);
      setError(null);
      netlifyIdentity.close();
      console.log('User logged in:', user.email);
    });

    netlifyIdentity.on('logout', () => {
      setUser(null);
      console.log('User logged out');
    });

    netlifyIdentity.on('error', (err) => {
      setError(err);
      console.error('Netlify Identity error:', err);
    });

    netlifyIdentity.on('init', (user) => {
      setUser(user);
      setLoading(false);
      console.log('Netlify Identity initialized');
    });

    // Clean up listeners on unmount
    return () => {
      netlifyIdentity.off('login');
      netlifyIdentity.off('logout');
      netlifyIdentity.off('error');
      netlifyIdentity.off('init');
    };
  }, []);

  const login = () => {
    netlifyIdentity.open('login');
  };

  const signup = () => {
    netlifyIdentity.open('signup');
  };

  const logout = () => {
    netlifyIdentity.logout();
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = await netlifyIdentity.update(updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const recoverPassword = (email) => {
    return netlifyIdentity.recover(email);
  };

  const getUserRole = () => {
    if (!user) return null;
    return user.app_metadata?.roles?.[0] || 'viewer';
  };

  const hasPermission = (permission) => {
    const role = getUserRole();
    const permissions = {
      admin: ['create', 'read', 'update', 'delete', 'manage_users'],
      auditor: ['create', 'read', 'update'],
      viewer: ['read']
    };
    return permissions[role]?.includes(permission) || false;
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateUser,
    recoverPassword,
    getUserRole,
    hasPermission,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}