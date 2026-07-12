export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',
  DASHBOARD: '/dashboard',
  VEHICLES: '/vehicles',
  DRIVERS: '/drivers',
  TRIPS: '/trips',
  MAINTENANCE: '/maintenance',
  FUEL_LOGS: '/fuel-logs',
  EXPENSES: '/expenses',
  REPORTS: '/reports',
  ANALYTICS: '/analytics',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
