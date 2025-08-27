import React, { createContext, ReactNode, useEffect, useState } from 'react';
import netlifyIdentity, { User } from 'netlify-identity-widget';

interface AuthContextValue {
  user: User | null;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    netlifyIdentity.init();
    netlifyIdentity.on('login', (user) => {
      setUser(user);
      netlifyIdentity.close();
    });
    netlifyIdentity.on('logout', () => setUser(null));
  }, []);

  const login = () => netlifyIdentity.open('login');
  const logout = () => netlifyIdentity.logout();

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
