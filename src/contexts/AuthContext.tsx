import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import netlifyIdentity, { User } from 'netlify-identity-widget';
import { initIdentity } from '../services/netlifyIdentity';

interface AuthContextValue {
  user: User | null;
  login: () => void;
  logout: () => void;
  getToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
  getToken: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    initIdentity();
    const current = netlifyIdentity.currentUser();
    if (current) {
      setUser(current);
    }

    const handleLogin = (identityUser: User) => {
      setUser(identityUser);
      netlifyIdentity.close();
    };

    const handleLogout = () => setUser(null);

    netlifyIdentity.on('login', handleLogin);
    netlifyIdentity.on('logout', handleLogout);

    return () => {
      netlifyIdentity.off('login', handleLogin);
      netlifyIdentity.off('logout', handleLogout);
    };
  }, []);

  const login = useCallback(() => netlifyIdentity.open('login'), []);
  const logout = useCallback(() => netlifyIdentity.logout(), []);
  const getToken = useCallback(async () => {
    const currentUser = netlifyIdentity.currentUser();
    if (!currentUser) {
      return null;
    }
    return currentUser.jwt();
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      getToken,
    }),
    [getToken, login, logout, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
