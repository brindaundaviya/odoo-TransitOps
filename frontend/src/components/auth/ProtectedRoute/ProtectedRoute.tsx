import { Outlet } from 'react-router-dom';

/**
 * Placeholder route guard — authentication and role checks
 * will be implemented in the Authentication module.
 */
export const ProtectedRoute = () => {
  return <Outlet />;
};
