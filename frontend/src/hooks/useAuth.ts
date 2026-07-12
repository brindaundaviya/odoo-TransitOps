import { useAuthContext } from '@/contexts/AuthContext';
import type { AuthState } from '@/types/auth.types';

export const useAuth = (): AuthState => {
  const { user, isAuthenticated } = useAuthContext();
  return { user, isAuthenticated };
};
