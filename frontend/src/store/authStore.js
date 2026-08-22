import { create } from 'zustand'
import { ROLES } from '@/constants/roles'

export const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  token: null,
  user: null,
  role: null,
  requiresPasswordChange: false,

  /**
   * Set user and token after successful login.
   * Stores requiresPasswordChange flag returned from backend.
   */
  setAuth: ({ user, token, requiresPasswordChange = false }) => {
    set({
      isAuthenticated: true,
      user,
      token,
      role: user?.role || ROLES.EMPLOYEE,
      requiresPasswordChange: Boolean(requiresPasswordChange),
    })
  },

  /**
   * Clear the password-change requirement after successful password change.
   */
  clearPasswordChangeFlag: () => {
    set({ requiresPasswordChange: false })
  },

  /**
   * Role switcher for development preview and testing (DEV only).
   */
  setRole: (newRole) => {
    set({ role: newRole })
  },

  /**
   * Clear auth session on logout.
   */
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      token: null,
      role: null,
      requiresPasswordChange: false,
    })
  },
}))
