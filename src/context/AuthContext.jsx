import React, { createContext, useContext, useState, useEffect } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import { usersApi } from '../utils/api';

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
  const [userRole, setUserRole] = useState(null);
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

    // Load saved role from localStorage
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      setUserRole(savedRole);
    }

    // Register existing user in our database and get their role
    if (currentUser) {
      // Default to Admin if no role is set (first user scenario)
      const storedRole = currentUser.app_metadata?.role || localStorage.getItem('userRole') || 'Admin';
      usersApi.register({
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
        role: storedRole,
        avatar: currentUser.user_metadata?.avatar_url || null,
      }).then(response => {
        // Use the role from the server if available
        if (response?.user?.role) {
          setUserRole(response.user.role);
          localStorage.setItem('userRole', response.user.role);
        } else if (!savedRole) {
          setUserRole(storedRole);
          localStorage.setItem('userRole', storedRole);
        }
      }).catch(error => {
        console.error('Failed to register existing user:', error);
        // Fall back to stored role or default
        if (!savedRole) {
          setUserRole(storedRole);
        }
      });
    }

    setLoading(false);

    // Listen for login events
    netlifyIdentity.on('login', async (user) => {
      setUser(user);
      netlifyIdentity.close();

      // Register user in our database and get their role
      try {
        // Default to Admin if no role is set (first user scenario)
        const storedRole = user.app_metadata?.role || localStorage.getItem('userRole') || 'Admin';
        const response = await usersApi.register({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email.split('@')[0],
          role: storedRole,
          avatar: user.user_metadata?.avatar_url || null,
        });
        // Use the role from the server if available
        if (response?.user?.role) {
          setUserRole(response.user.role);
          localStorage.setItem('userRole', response.user.role);
        } else {
          setUserRole(storedRole);
          localStorage.setItem('userRole', storedRole);
        }
      } catch (error) {
        console.error('Failed to register user:', error);
        // Fall back to stored role or default to Admin
        const fallbackRole = user.app_metadata?.role || localStorage.getItem('userRole') || 'Admin';
        setUserRole(fallbackRole);
        localStorage.setItem('userRole', fallbackRole);
      }
    });

    // Listen for logout events
    netlifyIdentity.on('logout', () => {
      setUser(null);
      setUserRole(null);
      setSelectedStation(null);
      localStorage.removeItem('selectedStation');
      localStorage.removeItem('userRole');
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
    userRole,
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
    isAdmin: userRole === 'Admin' || user?.app_metadata?.role === 'Admin' || user?.user_metadata?.role === 'Admin',
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
