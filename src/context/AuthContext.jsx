import React, { createContext, useContext, useState, useEffect } from 'react';
import netlifyIdentity from 'netlify-identity-widget';

const AuthContext = createContext(null);

// Available stations for Amazon Logistics
const STATIONS = [
  { id: 'DVI1', name: 'DVI1', fullName: 'Distribution Center 1', color: 'bg-blue-500' },
  { id: 'DVI2', name: 'DVI2', fullName: 'Distribution Center 2', color: 'bg-indigo-500' },
  { id: 'DVI3', name: 'DVI3', fullName: 'Distribution Center 3', color: 'bg-purple-500' },
  { id: 'DAP5', name: 'DAP5', fullName: 'Delivery Station 5', color: 'bg-green-500' },
  { id: 'DAP8', name: 'DAP8', fullName: 'Delivery Station 8', color: 'bg-teal-500' },
  { id: 'DXA1', name: 'DXA1', fullName: 'Express Station 1', color: 'bg-orange-500' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Netlify Identity
    netlifyIdentity.init();

    // Check for existing user session
    const currentUser = netlifyIdentity.currentUser();
    setUser(currentUser);

    // Load saved station from localStorage
    const savedStation = localStorage.getItem('selectedStation');
    if (savedStation) {
      const station = STATIONS.find(s => s.id === savedStation);
      if (station) {
        setSelectedStation(savedStation);
      }
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

  const selectStation = (stationId) => {
    const station = STATIONS.find(s => s.id === stationId);
    if (station) {
      setSelectedStation(stationId);
      localStorage.setItem('selectedStation', stationId);
    }
  };

  const getStationDetails = (stationId) => {
    return STATIONS.find(s => s.id === stationId);
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
    getStationDetails,
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
