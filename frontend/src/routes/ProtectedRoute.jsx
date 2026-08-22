import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants/routes'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, requiresPasswordChange } = useAuthStore()
  const location = useLocation()

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} state={{ from: location }} replace />
  }

  // First-login password change required → force to /change-password
  // (Allow access to /change-password itself so the user can complete it)
  if (requiresPasswordChange && location.pathname !== ROUTES.PUBLIC.CHANGE_PASSWORD) {
    return <Navigate to={ROUTES.PUBLIC.CHANGE_PASSWORD} replace />
  }

  return children ? children : <Outlet />
}
