/**
 * Centralized Role Constants for Dayflow HRMS
 */
export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  HR: 'HR',
  ADMIN: 'ADMIN',
}

export const ROLE_LABELS = {
  [ROLES.EMPLOYEE]: 'Employee',
  [ROLES.HR]: 'HR Manager',
  [ROLES.ADMIN]: 'Administrator',
}

/**
 * Checks if a user's role satisfies allowed roles.
 * ADMIN has access to all HR routes as well.
 */
export function hasRoleAccess(userRole, allowedRoles = []) {
  if (!userRole || !allowedRoles.length) return false
  if (userRole === ROLES.ADMIN) return true
  if (userRole === ROLES.HR && allowedRoles.includes(ROLES.HR)) return true
  return allowedRoles.includes(userRole)
}
