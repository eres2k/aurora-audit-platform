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
    const current = netlifyIdentity.currentUser();
    if (current) {
      setUser(current);
    }
    const handleLogin = (user: User) => {
      setUser(user);
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

  const login = () => netlifyIdentity.open('login');
  const logout = () => netlifyIdentity.logout();

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
