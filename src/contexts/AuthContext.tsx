import React, { createContext, ReactNode } from 'react';

interface AuthContextValue {}

export const AuthContext = createContext<AuthContextValue>({});

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}
