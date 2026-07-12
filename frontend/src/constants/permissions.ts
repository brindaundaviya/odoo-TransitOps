export const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_VEHICLES: 'manage_vehicles',
  VIEW_VEHICLES: 'view_vehicles',
  MANAGE_DRIVERS: 'manage_drivers',
  VIEW_DRIVERS: 'view_drivers',
  MANAGE_TRIPS: 'manage_trips',
  VIEW_TRIPS: 'view_trips',
  MANAGE_MAINTENANCE: 'manage_maintenance',
  VIEW_MAINTENANCE: 'view_maintenance',
  MANAGE_FUEL_LOGS: 'manage_fuel_logs',
  VIEW_FUEL_LOGS: 'view_fuel_logs',
  MANAGE_EXPENSES: 'manage_expenses',
  VIEW_EXPENSES: 'view_expenses',
  APPROVE_EXPENSES: 'approve_expenses',
  VIEW_REPORTS: 'view_reports',
  VIEW_ANALYTICS: 'view_analytics',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
