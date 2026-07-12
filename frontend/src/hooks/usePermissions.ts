import { ROLES, type Role } from '@/constants/roles';
import { PERMISSIONS, type Permission } from '@/constants/permissions';
import { useAuth } from './useAuth';


/**
 * Placeholder permission map — will be replaced with role-based logic
 * when authentication is implemented.
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.FLEET_MANAGER]: [
    PERMISSIONS.MANAGE_VEHICLES,
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.MANAGE_DRIVERS,
    PERMISSIONS.VIEW_DRIVERS,
    PERMISSIONS.MANAGE_TRIPS,
    PERMISSIONS.VIEW_TRIPS,
    PERMISSIONS.MANAGE_MAINTENANCE,
    PERMISSIONS.VIEW_MAINTENANCE,
    PERMISSIONS.MANAGE_FUEL_LOGS,
    PERMISSIONS.VIEW_FUEL_LOGS,
    PERMISSIONS.MANAGE_EXPENSES,
    PERMISSIONS.VIEW_EXPENSES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  [ROLES.DRIVER]: [
    PERMISSIONS.VIEW_TRIPS,
    PERMISSIONS.MANAGE_FUEL_LOGS,
    PERMISSIONS.VIEW_FUEL_LOGS,
    PERMISSIONS.MANAGE_EXPENSES,
    PERMISSIONS.VIEW_EXPENSES,
  ],
  [ROLES.SAFETY_OFFICER]: [
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.VIEW_DRIVERS,
    PERMISSIONS.VIEW_TRIPS,
    PERMISSIONS.MANAGE_MAINTENANCE,
    PERMISSIONS.VIEW_MAINTENANCE,
    PERMISSIONS.VIEW_FUEL_LOGS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  [ROLES.FINANCIAL_ANALYST]: [
    PERMISSIONS.VIEW_VEHICLES,
    PERMISSIONS.VIEW_DRIVERS,
    PERMISSIONS.VIEW_TRIPS,
    PERMISSIONS.VIEW_FUEL_LOGS,
    PERMISSIONS.VIEW_EXPENSES,
    PERMISSIONS.APPROVE_EXPENSES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
};
export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role].includes(permission);
  };

  const getPermissionsForRole = (role: Role): Permission[] => {
    return ROLE_PERMISSIONS[role];
  };

  return { hasPermission, getPermissionsForRole, ROLE_PERMISSIONS };
};
