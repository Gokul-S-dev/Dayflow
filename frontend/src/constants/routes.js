/**
 * Centralized Route Paths for Dayflow
 */
export const ROUTES = {
  PUBLIC: {
    LANDING: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    VERIFY_EMAIL: '/verify-email',
  },
  EMPLOYEE: {
    ROOT: '/employee',
    DASHBOARD: '/employee',
    PROFILE: '/employee/profile',
    ATTENDANCE: '/employee/attendance',
    LEAVE: '/employee/leave',
    PAYROLL: '/employee/payroll',
  },
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin',
    EMPLOYEES: '/admin/employees',
    ATTENDANCE: '/admin/attendance',
    LEAVE: '/admin/leave',
    PAYROLL: '/admin/payroll',
    INTELLIGENCE: '/admin/intelligence',
  },
  DEV: {
    DESIGN_SYSTEM: '/design-system',
  },
}
