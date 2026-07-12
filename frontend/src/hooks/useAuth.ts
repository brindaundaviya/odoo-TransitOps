import { useAuthContext, type AuthContextValue } from '@/contexts/AuthContext';

export const useAuth = (): AuthContextValue => {
  return useAuthContext();
};
