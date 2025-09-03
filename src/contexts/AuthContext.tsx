import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Predefined credentials
const VALID_USERNAME = 'USERtest';
const VALID_PASSWORD = 'test123';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user was previously authenticated
    const savedAuthState = localStorage.getItem('isAuthenticated');
    if (savedAuthState === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = (): void => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  const value: AuthContextType = {
    isAuthenticated,
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