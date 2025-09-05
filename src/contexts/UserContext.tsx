import React, { createContext, useContext } from "react";

interface UserContextType {
  user: any;
  setUser: (user: any) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ value: UserContextType; children: React.ReactNode }> = ({ value, children }) => (
  <UserContext.Provider value={value}>{children}</UserContext.Provider>
);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
