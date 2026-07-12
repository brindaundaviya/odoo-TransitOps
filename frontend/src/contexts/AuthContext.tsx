import { createContext, useContext, type ReactNode } from 'react';
import type { AuthState } from '@/types/auth.types';

type AuthContextValue = AuthState;

const defaultValue: AuthContextValue = {
  user: null,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextValue>(defaultValue);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  return <AuthContext.Provider value={defaultValue}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  return useContext(AuthContext);
};
