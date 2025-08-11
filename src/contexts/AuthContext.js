// Authentication Context for Aurora Audit Platform
// Handles user authentication with Netlify Identity

import React, { createContext, useState, useEffect, useContext } from 'react';
import netlifyIdentity from 'netlify-identity-widget';

// Initialize Netlify Identity
if (typeof window !== 'undefined') {
  netlifyIdentity.init({
    container: '#netlify-modal',
    locale: 'en'
  });
}

// Create context
const AuthContext = createContext({});

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    // Check for existing user
    const currentUser = netlifyIdentity.currentUser();
    if (currentUser) {
      setUser(formatUser(currentUser));
    }

    // Set up event listeners
    netlifyIdentity.on('login', (user) => {
      setUser(formatUser(user));
      netlifyIdentity.close();
      setError(null);
    });

    netlifyIdentity.on('logout', () => {
      setUser(null);
      setError(null);
    });

    netlifyIdentity.on('error', (err) => {
      setError(err.message);
    });

    netlifyIdentity.on('init', (user) => {
      setUser(user ? formatUser(user) : null);
      setLoading(false);
    });

    // Check if we're in development mode without Netlify Identity
    if (process.env.REACT_APP_MOCK_AUTH === 'true' && !currentUser) {
      // Use mock user for development
      const mockUser = {
        id: 'mock-user-123',
        email: 'demo@aurora.com',
        name: 'Demo User',
        role: 'admin',
        avatar: null,
        metadata: {
          full_name: 'Demo User',
          roles: ['admin', 'auditor']
        }
      };
      setUser(mockUser);
      setLoading(false);
    } else {
      setLoading(false);
    }

    // Cleanup
    return () => {
      netlifyIdentity.off('login');
      netlifyIdentity.off('logout');
      netlifyIdentity.off('error');
      netlifyIdentity.off('init');
    };
  }, []);

  // Format user object
  function formatUser(netlifyUser) {
    return {
      id: netlifyUser.id,
      email: netlifyUser.email,
      name: netlifyUser.user_metadata?.full_name || netlifyUser.email.split('@')[0],
      role: netlifyUser.app_metadata?.roles?.[0] || 'viewer',
      roles: netlifyUser.app_metadata?.roles || ['viewer'],
      avatar: netlifyUser.user_metadata?.avatar_url || null,
      metadata: {
        ...netlifyUser.user_metadata,
        ...netlifyUser.app_metadata
      },
      token: netlifyUser.token?.access_token,
      tokenExpiresAt: netlifyUser.token?.expires_at
    };
  }

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      if (process.env.REACT_APP_MOCK_AUTH === 'true') {
        // Mock login for development
        const mockUser = {
          id: 'mock-user-123',
          email: email,
          name: email.split('@')[0],
          role: 'admin',
          avatar: null,
          metadata: {
            full_name: email.split('@')[0],
            roles: ['admin', 'auditor']
          }
        };
        setUser(mockUser);
        setLoading(false);
        return mockUser;
      }

      // Use Netlify Identity for production
      return new Promise((resolve, reject) => {
        netlifyIdentity.open('login');
        
        const handleLogin = (user) => {
          netlifyIdentity.off('login', handleLogin);
          netlifyIdentity.off('error', handleError);
          resolve(formatUser(user));
        };
        
        const handleError = (err) => {
          netlifyIdentity.off('login', handleLogin);
          netlifyIdentity.off('error', handleError);
          reject(err);
        };
        
        netlifyIdentity.on('login', handleLogin);
        netlifyIdentity.on('error', handleError);
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (email, password, metadata = {}) => {
    try {
      setError(null);
      setLoading(true);

      if (process.env.REACT_APP_MOCK_AUTH === 'true') {
        // Mock signup for development
        const mockUser = {
          id: `mock-user-${Date.now()}`,
          email: email,
          name: metadata.full_name || email.split('@')[0],
          role: 'viewer',
          avatar: null,
          metadata: {
            full_name: metadata.full_name || email.split('@')[0],
            roles: ['viewer'],
            ...metadata
          }
        };
        setUser(mockUser);
        setLoading(false);
        return mockUser;
      }

      // Use Netlify Identity for production
      return new Promise((resolve, reject) => {
        netlifyIdentity.open('signup');
        
        const handleSignup = (user) => {
          netlifyIdentity.off('signup', handleSignup);
          netlifyIdentity.off('error', handleError);
          
          // Update user metadata if provided
          if (Object.keys(metadata).length > 0) {
            user.update({ data: metadata });
          }
          
          resolve(formatUser(user));
        };
        
        const handleError = (err) => {
          netlifyIdentity.off('signup', handleSignup);
          netlifyIdentity.off('error', handleError);
          reject(err);
        };
        
        netlifyIdentity.on('signup', handleSignup);
        netlifyIdentity.on('error', handleError);
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setError(null);
      setLoading(true);

      if (process.env.REACT_APP_MOCK_AUTH === 'true') {
        setUser(null);
        setLoading(false);
        return;
      }

      netlifyIdentity.logout();
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      setError(null);
      setLoading(true);

      if (process.env.REACT_APP_MOCK_AUTH === 'true') {
        const updatedUser = {
          ...user,
          ...updates,
          metadata: {
            ...user.metadata,
            ...updates
          }
        };
        setUser(updatedUser);
        setLoading(false);
        return updatedUser;
      }

      const currentUser = netlifyIdentity.currentUser();
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      await currentUser.update({ data: updates });
      setUser(formatUser(currentUser));
      
      return formatUser(currentUser);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError(null);
      setLoading(true);

      if (process.env.REACT_APP_MOCK_AUTH === 'true') {
        console.log('Password reset email sent to:', email);
        setLoading(false);
        return { success: true };
      }

      netlifyIdentity.recover(email);
      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const currentUser = netlifyIdentity.currentUser();
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      await currentUser.jwt();
      setUser(formatUser(currentUser));
      
      return formatUser(currentUser);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Check if user has role
  const hasRole = (role) => {
    if (!user) return false;
    return user.roles?.includes(role) || user.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.some(role => hasRole(role));
  };

  // Check if user has all of the specified roles
  const hasAllRoles = (roles) => {
    if (!user) return false;
    return roles.every(role => hasRole(role));
  };

  // Get auth headers for API calls
  const getAuthHeaders = () => {
    if (!user?.token) return {};
    
    return {
      'Authorization': `Bearer ${user.token}`,
      'X-User-Id': user.id,
      'X-User-Role': user.role
    };
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    resetPassword,
    refreshToken,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getAuthHeaders,
    isAuthenticated: !!user,
    isAdmin: hasRole('admin'),
    isAuditor: hasAnyRole(['admin', 'auditor']),
    isViewer: hasAnyRole(['admin', 'auditor', 'viewer'])
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <div id="netlify-modal" />
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// HOC for protected components
export function withAuth(Component, options = {}) {
  return function AuthenticatedComponent(props) {
    const auth = useAuth();
    
    // Check authentication
    if (!auth.isAuthenticated && !auth.loading) {
      // Redirect to login or show unauthorized message
      if (options.redirect) {
        window.location.href = '/login';
        return null;
      }
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access this page.</p>
            <button
              onClick={() => auth.login()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Log In
            </button>
          </div>
        </div>
      );
    }
    
    // Check roles if specified
    if (options.roles && !auth.hasAnyRole(options.roles)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Unauthorized</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }
    
    // Show loading state
    if (auth.loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    // Render component with auth props
    return <Component {...props} auth={auth} />;
  };
}

export default AuthContext;