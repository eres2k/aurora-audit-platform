import React, { createContext, useContext, useState, useEffect } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import { usersApi } from '../utils/api';

const AuthContext = createContext(null);

// Super admin emails - these users always have admin access regardless of role settings
const SUPER_ADMIN_EMAILS = [
  'erwin.esener@gmail.com',
  // Add more super admin emails here as needed
];

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

    // Register existing user in our database
    if (currentUser) {
      usersApi.register({
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
        role: currentUser.app_metadata?.role || 'Auditor',
        avatar: currentUser.user_metadata?.avatar_url || null,
      }).catch(error => {
        console.error('Failed to register existing user:', error);
      });
    }

    setLoading(false);

    // Listen for login events
    netlifyIdentity.on('login', async (user) => {
      setUser(user);
      netlifyIdentity.close();

      // Register user in our database
      try {
        await usersApi.register({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email.split('@')[0],
          role: user.app_metadata?.role || 'Auditor',
          avatar: user.user_metadata?.avatar_url || null,
        });
      } catch (error) {
        console.error('Failed to register user:', error);
      }
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

  // Check if user is admin - centralized logic
  // Checks: 1) Super admin email list, 2) app_metadata.role, 3) user_metadata.role
  const checkIsAdmin = (userObj) => {
    if (!userObj) return false;

    // Check if email is in super admin list (case-insensitive)
    const email = userObj.email?.toLowerCase();
    if (email && SUPER_ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === email)) {
      return true;
    }

    // Check Netlify Identity metadata
    if (userObj.app_metadata?.role === 'Admin') return true;
    if (userObj.user_metadata?.role === 'Admin') return true;

    return false;
  };

  const isAdmin = checkIsAdmin(user);

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
    isAdmin, // Centralized admin check
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
