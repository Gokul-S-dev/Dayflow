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
    category: 'primary',
  },
  {
    label: 'Attendance',
    path: ROUTES.EMPLOYEE.ATTENDANCE,
    icon: Clock,
    category: 'primary',
  },
  {
    label: 'Time Off',
    path: ROUTES.EMPLOYEE.LEAVE,
    icon: CalendarDays,
    category: 'primary',
  },
  {
    label: 'My Profile',
    path: ROUTES.EMPLOYEE.PROFILE,
    icon: User,
    category: 'secondary',
  },
  {
    label: 'Payroll',
    path: ROUTES.EMPLOYEE.PAYROLL,
    icon: CreditCard,
    category: 'secondary',
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
    category: 'primary',
    roles: [ROLES.ADMIN, ROLES.HR],
  },
  {
    label: 'Attendance',
    path: ROUTES.ADMIN.ATTENDANCE,
    icon: Clock,
    category: 'primary',
    roles: [ROLES.ADMIN, ROLES.HR],
  },
  {
    label: 'Time Off',
    path: ROUTES.ADMIN.LEAVE,
    icon: CalendarCheck,
    category: 'primary',
    roles: [ROLES.ADMIN, ROLES.HR],
  },
  {
    label: 'Dashboard',
    path: ROUTES.ADMIN.DASHBOARD,
    icon: LayoutDashboard,
    category: 'secondary',
    roles: [ROLES.ADMIN, ROLES.HR],
  },
  {
    label: 'Payroll',
    path: ROUTES.ADMIN.PAYROLL,
    icon: CreditCard,
    category: 'secondary',
    roles: [ROLES.ADMIN],
    adminOnly: true,
  },
  {
    label: 'Intelligence',
    path: ROUTES.ADMIN.INTELLIGENCE,
    icon: BrainCircuit,
    category: 'secondary',
    roles: [ROLES.ADMIN, ROLES.HR],
    badge: 'AI',
  },
]

/**
 * Returns navigation items for a given role.
 */
export function getNavigationForRole(role) {
  const items = role === ROLES.ADMIN || role === ROLES.HR ? ADMIN_NAV_ITEMS : EMPLOYEE_NAV_ITEMS
  if (role === ROLES.HR) {
    return items.filter((item) => !item.adminOnly)
  }
  return items;
}

