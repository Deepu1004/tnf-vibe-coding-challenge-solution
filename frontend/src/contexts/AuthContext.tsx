import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '../api';

type UserRole = 'author' | 'editor';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  email: string | null;
}

interface AuthContextType extends AuthState {
  login: (role: UserRole, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    email: null,
  });

  // Basic persistence
  useEffect(() => {
    const saved = localStorage.getItem('auth_state');
    if (saved) {
      setAuth(JSON.parse(saved));
    }
  }, []);

  const login = async (role: UserRole, email: string, password?: string) => {
    if (role === 'editor') {
      try {
        const data = await api.post('/api/auth/editor', { email, password });
        if (data.success) {
          const newState = { isAuthenticated: true, role, email };
          setAuth(newState);
          localStorage.setItem('auth_state', JSON.stringify(newState));
          return true;
        }
        return false;
      } catch (err) {
        return false;
      }
    } else {
      // Author login is just demo mock
      const newState = { isAuthenticated: true, role, email };
      setAuth(newState);
      localStorage.setItem('auth_state', JSON.stringify(newState));
      return true;
    }
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, role: null, email: null });
    localStorage.removeItem('auth_state');
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
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
