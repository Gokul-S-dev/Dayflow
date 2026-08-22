/**
 * Backend API Endpoints (Known contracts from Node.js/Express backend)
 */
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP_COMPANY: '/auth/signup-company',
    SIGNUP: '/auth/signup',
    VERIFY_EMAIL: '/auth/verify-email',
    LOGIN: '/auth/login',
    CHANGE_PASSWORD: '/auth/change-password',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  EMPLOYEES: {
    BASE: '/employees',
    BY_ID: (id) => `/employees/${id}`,
  },
}
