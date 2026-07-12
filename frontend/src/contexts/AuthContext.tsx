import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types/auth.types';
import { authService } from '@/services/api/authService';
import { tokenStorage } from '@/services/storage/tokenStorage';

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

const defaultValue: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextValue>(defaultValue);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenStorage.get();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await authService.getProfile();
        setUser(profile);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to restore auth session:', error);
        tokenStorage.remove();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const { accessToken, user: loggedUser } = await authService.login(credentials);
      tokenStorage.set(accessToken);
      setUser(loggedUser);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      tokenStorage.remove();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    tokenStorage.remove();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
