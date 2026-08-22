import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { RoleRoute } from '@/routes/RoleRoute'
import { AppShell } from '@/components/layout/AppShell'

// Public Feature Pages
import { LandingPage } from '@/features/public/pages/LandingPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignupPage } from '@/features/auth/pages/SignupPage'
import { CompanySignupPage } from '@/features/auth/pages/CompanySignupPage'
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage'

// Employee Feature Pages
import { EmployeeDashboardPage } from '@/features/employee/pages/EmployeeDashboardPage'
import { EmployeeProfilePage } from '@/features/employee/pages/EmployeeProfilePage'
import { EmployeeAttendancePage } from '@/features/employee/pages/EmployeeAttendancePage'
import { EmployeeLeavePage } from '@/features/employee/pages/EmployeeLeavePage'
import { EmployeePayrollPage } from '@/features/employee/pages/EmployeePayrollPage'

// Admin / HR Feature Pages
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage'
import { AdminEmployeesPage } from '@/features/admin/pages/AdminEmployeesPage'
import { AdminEmployeeDetailsPage } from '@/features/admin/pages/AdminEmployeeDetailsPage'
import { AdminAttendancePage } from '@/features/admin/pages/AdminAttendancePage'
import { AdminLeavePage } from '@/features/admin/pages/AdminLeavePage'
import { AdminPayrollPage } from '@/features/admin/pages/AdminPayrollPage'
import { AdminIntelligencePage } from '@/features/intelligence/pages/AdminIntelligencePage'

// Design System Showcase
import { DesignSystemShowcase } from '@/components/DesignSystemShowcase'

export const router = createBrowserRouter([
  // Public Routes
  {
    path: ROUTES.PUBLIC.LANDING,
    element: <LandingPage />,
  },
  {
    path: ROUTES.PUBLIC.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.PUBLIC.SIGNUP,
    element: <SignupPage />,
  },
  {
    path: '/company-signup',
    element: <CompanySignupPage />,
  },
  {
    path: ROUTES.PUBLIC.VERIFY_EMAIL,
    element: <VerifyEmailPage />,
  },
  {
    path: ROUTES.DEV.DESIGN_SYSTEM,
    element: <DesignSystemShowcase />,
  },

  // Authenticated App Shell Root
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      // Employee Portal Routes
      {
        path: ROUTES.EMPLOYEE.ROOT,
        element: (
          <RoleRoute allowedRoles={[ROLES.EMPLOYEE, ROLES.HR, ROLES.ADMIN]} />
        ),
        children: [
          {
            index: true,
            element: <EmployeeDashboardPage />,
          },
          {
            path: 'profile',
            element: <EmployeeProfilePage />,
          },
          {
            path: 'attendance',
            element: <EmployeeAttendancePage />,
          },
          {
            path: 'leave',
            element: <EmployeeLeavePage />,
          },
          {
            path: 'payroll',
            element: <EmployeePayrollPage />,
          },
        ],
      },

      // Admin & HR Portal Routes
      {
        path: ROUTES.ADMIN.ROOT,
        element: (
          <RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.HR]} />
        ),
        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
          },
          {
            path: 'employees',
            element: <AdminEmployeesPage />,
          },
          {
            path: 'employees/:id',
            element: <AdminEmployeeDetailsPage />,
          },
          {
            path: 'attendance',
            element: <AdminAttendancePage />,
          },
          {
            path: 'leave',
            element: <AdminLeavePage />,
          },
          {
            path: 'payroll',
            element: <AdminPayrollPage />,
          },
          {
            path: 'intelligence',
            element: <AdminIntelligencePage />,
          },
        ],
      },
    ],
  },

  // Fallback Route
  {
    path: '*',
    element: <Navigate to={ROUTES.PUBLIC.LANDING} replace />,
  },
])
