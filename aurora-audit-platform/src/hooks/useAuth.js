import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a default value if not in provider
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
