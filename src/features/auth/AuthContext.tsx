import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth } from '@/lib/auth';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
    setLoading(false);

    const unsubscribe = auth.onAuthChange((nextUser) => {
      setUser(nextUser);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await auth.login(email, password);
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
