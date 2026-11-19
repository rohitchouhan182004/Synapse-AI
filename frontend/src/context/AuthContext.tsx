import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface AuthState {
  token: string | null;
  user: {
    id: number;
    email: string;
    full_name: string;
    has_profile: boolean;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
  updateUser: (data: Partial<AuthState['user']>) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('synapse_token'));
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('synapse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const me = await api.getMe();
          if (user) {
            setUser((prev: any) => ({ ...prev, has_profile: me.has_profile }));
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyAuth();

    const handleAuthChange = () => {
      setToken(localStorage.getItem('synapse_token'));
      const saved = localStorage.getItem('synapse_user');
      setUser(saved ? JSON.parse(saved) : null);
    };

    window.addEventListener('synapse_auth_change', handleAuthChange);
    return () => window.removeEventListener('synapse_auth_change', handleAuthChange);
  }, []);

  const login = (newToken: string, newUser: any) => {
    localStorage.setItem('synapse_token', newToken);
    localStorage.setItem('synapse_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('synapse_token');
    localStorage.removeItem('synapse_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (data: any) => {
    setUser((prev: any) => {
      const updated = { ...prev, ...data };
      localStorage.setItem('synapse_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
