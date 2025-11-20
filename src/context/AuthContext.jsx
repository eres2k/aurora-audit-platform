import React, { createContext, useContext, useState, useEffect } from 'react';
import netlifyIdentity from 'netlify-identity-widget';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Available stations
  const STATIONS = ['DVI1', 'DVI2', 'DVI3', 'DAP5', 'DAP8'];

  useEffect(() => {
    // Initialize Netlify Identity
    netlifyIdentity.init();

    // Check for existing user session
    const currentUser = netlifyIdentity.currentUser();
    setUser(currentUser);

    // Load saved station from localStorage
    const savedStation = localStorage.getItem('selectedStation');
    if (savedStation && STATIONS.includes(savedStation)) {
      setSelectedStation(savedStation);
    }

    setLoading(false);

    // Listen for login events
    netlifyIdentity.on('login', (user) => {
      setUser(user);
      netlifyIdentity.close();
    });

    // Listen for logout events
    netlifyIdentity.on('logout', () => {
      setUser(null);
      setSelectedStation(null);
      localStorage.removeItem('selectedStation');
    });

    // Cleanup
    return () => {
      netlifyIdentity.off('login');
      netlifyIdentity.off('logout');
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

  const selectStation = (station) => {
    if (STATIONS.includes(station)) {
      setSelectedStation(station);
      localStorage.setItem('selectedStation', station);
    }
  };

  const value = {
    user,
    selectedStation,
    stations: STATIONS,
    loading,
    login,
    signup,
    logout,
    selectStation,
    isAuthenticated: !!user,
    hasSelectedStation: !!selectedStation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
