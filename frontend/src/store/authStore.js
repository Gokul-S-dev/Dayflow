import { create } from 'zustand'
import { ROLES } from '@/constants/roles'

const DEMO_USERS = {
  [ROLES.ADMIN]: {
    id: 'usr_admin_01',
    name: 'Alexandra Vance',
    email: 'alexandra.vance@dayflow.io',
    role: ROLES.ADMIN,
    department: 'People Operations & Leadership',
    avatar: null,
  },
  [ROLES.HR]: {
    id: 'usr_hr_01',
    name: 'Marcus Chen',
    email: 'marcus.chen@dayflow.io',
    role: ROLES.HR,
    department: 'Human Resources',
    avatar: null,
  },
  [ROLES.EMPLOYEE]: {
    id: 'usr_emp_01',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@dayflow.io',
    role: ROLES.EMPLOYEE,
    department: 'Engineering',
    avatar: null,
  },
}

export const useAuthStore = create((set, get) => ({
  // Default to authenticated with ADMIN role for development preview
  isAuthenticated: true,
  token: 'mock-jwt-token-for-dev',
  user: DEMO_USERS[ROLES.ADMIN],
  role: ROLES.ADMIN,

  /**
   * Set user and token after successful login
   */
  setAuth: ({ user, token }) => {
    set({
      isAuthenticated: true,
      user,
      token,
      role: user?.role || ROLES.EMPLOYEE,
    })
  },

  /**
   * Role switcher for development preview and testing
   */
  setRole: (newRole) => {
    const demoUser = DEMO_USERS[newRole] || {
      id: 'usr_custom',
      name: 'Custom User',
      email: 'user@dayflow.io',
      role: newRole,
      department: 'Operations',
    }
    set({
      role: newRole,
      user: demoUser,
      isAuthenticated: true,
    })
  },

  /**
   * Toggle authentication status for testing ProtectedRoute
   */
  toggleAuth: () => {
    const current = get().isAuthenticated
    set({
      isAuthenticated: !current,
      token: !current ? 'mock-jwt-token-for-dev' : null,
    })
  },

  /**
   * Clear auth session
   */
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      token: null,
      role: null,
    })
  },
}))
