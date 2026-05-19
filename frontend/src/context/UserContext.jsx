import { createContext, useContext, useState } from "react";

// Create the context
const UserContext = createContext(null);

// Provider — wraps the app and holds dbUser state
export function UserProvider({ children }) {
  const [dbUser, setDbUser] = useState(null);

  return (
    <UserContext.Provider value={{ dbUser, setDbUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook — any component can call useUser() to get dbUser
export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used inside UserProvider");
  return context;
}
