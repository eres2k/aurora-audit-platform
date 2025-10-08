import React, { createContext, ReactNode, useEffect, useState } from 'react';
import netlifyIdentity, { User } from 'netlify-identity-widget';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshToken: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    netlifyIdentity.init();

    const current = netlifyIdentity.currentUser();
    if (current) {
      setUser(current);
      current
        .jwt()
        .then(setToken)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    const handleLogin = async (identityUser: User) => {
      setUser(identityUser);
      const jwt = await identityUser.jwt();
      setToken(jwt);
      netlifyIdentity.close();
    };

    const handleLogout = () => {
      setUser(null);
      setToken(null);
    };

    netlifyIdentity.on('login', handleLogin);
    netlifyIdentity.on('logout', handleLogout);

    return () => {
      netlifyIdentity.off('login', handleLogin);
      netlifyIdentity.off('logout', handleLogout);
    };
  }, []);

  const login = () => netlifyIdentity.open('login');
  const logout = () => netlifyIdentity.logout();
  const refreshToken = async () => {
    const current = netlifyIdentity.currentUser();
    if (!current) {
      setToken(null);
      setUser(null);
      return null;
    }
    const jwt = await current.jwt();
    setToken(jwt);
    setUser(current);
    return jwt;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}
