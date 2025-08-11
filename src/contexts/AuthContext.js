// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo user in localStorage first
    const savedUser = localStorage.getItem('aurora_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }

    // Initialize Netlify Identity if available
    if (typeof window !== 'undefined' && window.netlifyIdentity) {
      window.netlifyIdentity.init();
      
      const currentUser = window.netlifyIdentity.currentUser();
      if (currentUser) {
        setUser(currentUser);
      }

      // Set up event listeners
      window.netlifyIdentity.on('login', (user) => {
        setUser(user);
        localStorage.setItem('aurora_user', JSON.stringify(user));
        window.netlifyIdentity.close();
      });

      window.netlifyIdentity.on('logout', () => {
        setUser(null);
        localStorage.removeItem('aurora_user');
      });
    }

    setLoading(false);
  }, []);

  const login = () => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.open('login');
    } else {
      // Demo login fallback
      const demoUser = {
        email: 'demo@aurora.com',
        user_metadata: { full_name: 'Demo User' },
        id: 'demo-user-001'
      };
      setUser(demoUser);
      localStorage.setItem('aurora_user', JSON.stringify(demoUser));
    }
  };

  const logout = () => {
    if (window.netlifyIdentity && window.netlifyIdentity.currentUser()) {
      window.netlifyIdentity.logout();
    } else {
      setUser(null);
      localStorage.removeItem('aurora_user');
      window.location.href = '/login';
    }
  };

  const signup = () => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.open('signup');
    } else {
      // For demo, just login
      login();
    }
  };

  const value = {
    user,
    login,
    logout,
    signup,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;