import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Predefined credentials
const VALID_USERS = [
  { username: 'USERtest', password: 'test123' },
  { username: 'abderrahmane', password: 'test123' }
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user was previously authenticated
    const savedAuthState = localStorage.getItem('isAuthenticated');
    const savedUsername = localStorage.getItem('username');
    if (savedAuthState === 'true' && savedUsername) {
      setIsAuthenticated(true);
      setUsername(savedUsername);
    }
    setLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    const validUser = VALID_USERS.find(user => user.username === username && user.password === password);
    if (validUser) {
      setIsAuthenticated(true);
      setUsername(username);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', username);
      return true;
    }
    return false;
  };

  const logout = (): void => {
    setIsAuthenticated(false);
    setUsername(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
  };

  const value: AuthContextType = {
    isAuthenticated,
    username,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};