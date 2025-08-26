import React, { createContext, ReactNode } from 'react';

interface AuditContextValue {}

export const AuditContext = createContext<AuditContextValue>({});

export function AuditProvider({ children }: { children: ReactNode }) {
  return <AuditContext.Provider value={{}}>{children}</AuditContext.Provider>;
}
