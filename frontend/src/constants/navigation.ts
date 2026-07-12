import { ROUTES } from './routes';
import { ROLES, type Role } from './roles';

export type NavItemId =
  | 'dashboard'
  | 'vehicles'
  | 'drivers'
  | 'trips'
  | 'maintenance'
  | 'fuel-logs'
  | 'expenses'
  | 'reports'
  | 'analytics';

export interface NavItem {
  id: NavItemId;
  label: string;
  path: string;
  section?: 'main' | 'insights';
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: ROUTES.DASHBOARD, section: 'main' },
  { id: 'vehicles', label: 'Vehicles', path: ROUTES.VEHICLES, section: 'main' },
  { id: 'drivers', label: 'Drivers', path: ROUTES.DRIVERS, section: 'main' },
  { id: 'trips', label: 'Trips', path: ROUTES.TRIPS, section: 'main' },
  { id: 'maintenance', label: 'Maintenance', path: ROUTES.MAINTENANCE, section: 'main' },
  { id: 'fuel-logs', label: 'Fuel Logs', path: ROUTES.FUEL_LOGS, section: 'main' },
  { id: 'expenses', label: 'Expenses', path: ROUTES.EXPENSES, section: 'main' },
  { id: 'reports', label: 'Reports', path: ROUTES.REPORTS, section: 'insights' },
  { id: 'analytics', label: 'Analytics', path: ROUTES.ANALYTICS, section: 'insights' },
];

/**
 * Role-to-navigation mapping for future RBAC filtering.
 * Not wired to Sidebar yet — display logic will be added with usePermissions.
 */
export const ROLE_NAVIGATION_MAP: Record<Role, NavItemId[]> = {
  [ROLES.ADMIN]: [
    'dashboard',
    'vehicles',
    'drivers',
    'trips',
    'maintenance',
    'fuel-logs',
    'expenses',
    'reports',
    'analytics',
  ],
  [ROLES.FLEET_MANAGER]: [
    'dashboard',
    'vehicles',
    'drivers',
    'trips',
    'maintenance',
    'fuel-logs',
    'expenses',
    'reports',
    'analytics',
  ],
  [ROLES.DRIVER]: ['dashboard', 'trips', 'fuel-logs', 'expenses'],
  [ROLES.SAFETY_OFFICER]: [
    'dashboard',
    'vehicles',
    'drivers',
    'trips',
    'maintenance',
    'fuel-logs',
    'reports',
    'analytics',
  ],
  [ROLES.FINANCIAL_ANALYST]: [
    'dashboard',
    'vehicles',
    'drivers',
    'fuel-logs',
    'expenses',
    'reports',
    'analytics',
  ],
};
