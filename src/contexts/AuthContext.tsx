import React, { createContext, useContext, useState, useEffect } from 'react';

interface Coach {
  id: string;
  username: string;
  name: string;
  email: string;
  ageGroups: any[];
}

interface AuthContextType {
  coach: Coach | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (token) {
      // Verify token and get coach info
      fetchCoachInfo();
    }
  }, [token]);

  const fetchCoachInfo = async () => {
    try {
      // For now, we'll store coach info in localStorage
      const storedCoach = localStorage.getItem('coach');
      if (storedCoach) {
        setCoach(JSON.parse(storedCoach));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to fetch coach info:', error);
      logout();
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      setToken(data.token);
      setCoach(data.coach);
      setIsAuthenticated(true);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('coach', JSON.stringify(data.coach));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setCoach(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('coach');
  };

  const value = {
    coach,
    token,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}