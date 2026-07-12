import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROUTES } from '@/constants/routes';

import LoginPage from '@/pages/auth/LoginPage';
import UnauthorizedPage from '@/pages/auth/UnauthorizedPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import VehicleListPage from '@/pages/vehicles/VehicleListPage';
import DriverListPage from '@/pages/drivers/DriverListPage';
import TripListPage from '@/pages/trips/TripListPage';
import MaintenanceListPage from '@/pages/maintenance/MaintenanceListPage';
import FuelLogListPage from '@/pages/fuel/FuelLogListPage';
import ExpenseListPage from '@/pages/expenses/ExpenseListPage';
import ReportsPage from '@/pages/reports/ReportsPage';
import AnalyticsPage from '@/pages/analytics/AnalyticsPage';
import NotFoundPage from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.UNAUTHORIZED,
    element: <UnauthorizedPage />,
  },
  {
    path: ROUTES.HOME,
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
          { path: ROUTES.DASHBOARD.slice(1), element: <DashboardPage /> },
          { path: ROUTES.VEHICLES.slice(1), element: <VehicleListPage /> },
          { path: ROUTES.DRIVERS.slice(1), element: <DriverListPage /> },
          { path: ROUTES.TRIPS.slice(1), element: <TripListPage /> },
          { path: ROUTES.MAINTENANCE.slice(1), element: <MaintenanceListPage /> },
          { path: ROUTES.FUEL_LOGS.slice(1), element: <FuelLogListPage /> },
          { path: ROUTES.EXPENSES.slice(1), element: <ExpenseListPage /> },
          { path: ROUTES.REPORTS.slice(1), element: <ReportsPage /> },
          { path: ROUTES.ANALYTICS.slice(1), element: <AnalyticsPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
