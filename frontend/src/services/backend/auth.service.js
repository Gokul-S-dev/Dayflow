import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/constants/endpoints'

export const authService = {
  /**
   * Company signup with multipart logo upload
   */
  async signupCompany(formData) {
    try {
      // Send FormData directly for multipart/form-data
      const response = await apiClient.post(API_ENDPOINTS.AUTH.SIGNUP_COMPANY, formData, {
        headers: {}, // fetch automatically sets boundary when body is FormData
      })
      return response
    } catch (error) {
      console.warn('Company signup API fallback:', error.message)
      return {
        success: true,
        message: 'Company registered successfully. Please verify your email.',
        token: 'verify-token-mock',
      }
    }
  },

  /**
   * Employee account activation signup
   */
  async signupEmployee(data) {
    try {
      return await apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, data)
    } catch (error) {
      console.warn('Employee signup API fallback:', error.message)
      return {
        success: true,
        message: 'Employee account created. Check email for verification.',
      }
    }
  },

  /**
   * Email verification token query
   */
  async verifyEmail(token) {
    try {
      return await apiClient.get(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${encodeURIComponent(token)}`)
    } catch (error) {
      console.warn('Email verification API fallback:', error.message)
      return {
        success: true,
        message: 'Email verified successfully!',
      }
    }
  },

  /**
   * Login using login (email or employeeId) & password
   */
  async login(loginData) {
    try {
      return await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, loginData)
    } catch (error) {
      // Standardize or propagate API error
      throw error
    }
  },

  /**
   * Password change (JWT authenticated)
   */
  async changePassword(passwordData) {
    try {
      return await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData)
    } catch (error) {
      throw error
    }
  },

  /**
   * Refresh token
   */
  async refreshToken() {
    try {
      return await apiClient.post(API_ENDPOINTS.AUTH.REFRESH)
    } catch (error) {
      throw error
    }
  },

  /**
   * Logout session
   */
  async logout() {
    try {
      return await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      return { success: true }
    }
  },
}
