import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { hasRoleAccess, ROLES } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'

export function RoleRoute({ allowedRoles = [], children }) {
  const { role } = useAuthStore()

  const hasAccess = hasRoleAccess(role, allowedRoles)

  if (!hasAccess) {
    // Redirect based on current role
    const fallbackPath = role === ROLES.EMPLOYEE ? ROUTES.EMPLOYEE.DASHBOARD : ROUTES.ADMIN.EMPLOYEES
    return <Navigate to={fallbackPath} replace />
  }

  return children ? children : <Outlet />
}
