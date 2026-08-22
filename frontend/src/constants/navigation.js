import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  CreditCard,
  Users,
  CalendarCheck,
  BrainCircuit,
  Settings,
  Sparkles,
} from 'lucide-react'
import { ROUTES } from './routes'
import { ROLES } from './roles'

/**
 * Employee Navigation Items
 */
export const EMPLOYEE_NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: ROUTES.EMPLOYEE.DASHBOARD,
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'My Profile',
    path: ROUTES.EMPLOYEE.PROFILE,
    icon: User,
  },
  {
    label: 'Attendance',
    path: ROUTES.EMPLOYEE.ATTENDANCE,
    icon: Clock,
  },
  {
    label: 'Time Off',
    path: ROUTES.EMPLOYEE.LEAVE,
    icon: CalendarDays,
  },
  {
    label: 'Payroll',
    path: ROUTES.EMPLOYEE.PAYROLL,
    icon: CreditCard,
  },
]

/**
 * Admin & HR Navigation Items
 */
export const ADMIN_NAV_ITEMS = [
  {
    label: 'Employees',
    path: ROUTES.ADMIN.EMPLOYEES,
    icon: Users,
    roles: [ROLES.ADMIN, ROLES.HR],
  },
  {
    label: 'Attendance',
    path: ROUTES.ADMIN.ATTENDANCE,
    icon: Clock,
    roles: [ROLES.ADMIN, ROLES.HR],
  },
  {
    label: 'Time Off',
    path: ROUTES.ADMIN.LEAVE,
    icon: CalendarCheck,
    roles: [ROLES.ADMIN, ROLES.HR],
  },
  {
    label: 'Dashboard',
    path: ROUTES.ADMIN.DASHBOARD,
    icon: LayoutDashboard,
    roles: [ROLES.ADMIN, ROLES.HR],
  },
  {
    label: 'Payroll',
    path: ROUTES.ADMIN.PAYROLL,
    icon: CreditCard,
    roles: [ROLES.ADMIN, ROLES.HR],
  },
  {
    label: 'Intelligence',
    path: ROUTES.ADMIN.INTELLIGENCE,
    icon: BrainCircuit,
    roles: [ROLES.ADMIN, ROLES.HR],
    badge: 'AI',
  },
]

/**
 * Returns navigation items for a given role.
 */
export function getNavigationForRole(role) {
  if (role === ROLES.ADMIN || role === ROLES.HR) {
    return ADMIN_NAV_ITEMS
  }
  return EMPLOYEE_NAV_ITEMS
}
