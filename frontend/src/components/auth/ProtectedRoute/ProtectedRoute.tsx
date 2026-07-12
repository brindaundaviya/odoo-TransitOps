import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { ROLE_NAVIGATION_MAP, type NavItemId } from '@/constants/navigation';

export const ProtectedRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  const getNavItemForPath = (pathname: string): NavItemId | null => {
    if (pathname === '/' || pathname.startsWith('/dashboard')) return 'dashboard';
    if (pathname.startsWith('/vehicles')) return 'vehicles';
    if (pathname.startsWith('/drivers')) return 'drivers';
    if (pathname.startsWith('/trips')) return 'trips';
    if (pathname.startsWith('/maintenance')) return 'maintenance';
    if (pathname.startsWith('/fuel-logs')) return 'fuel-logs';
    if (pathname.startsWith('/expenses')) return 'expenses';
    if (pathname.startsWith('/reports')) return 'reports';
    if (pathname.startsWith('/analytics')) return 'analytics';
    return null;
  };

  const navItem = getNavItemForPath(location.pathname);
  if (navItem) {
    const allowedItems = ROLE_NAVIGATION_MAP[user.role];
    if (!allowedItems || !allowedItems.includes(navItem)) {
      return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
    }
  }

  return <Outlet />;
};
