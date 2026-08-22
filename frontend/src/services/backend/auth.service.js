import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/constants/endpoints'

export const authService = {
  /**
   * Company signup with multipart logo upload
   */
  async signupCompany(formData) {
    return await apiClient.post(API_ENDPOINTS.AUTH.SIGNUP_COMPANY, formData, {
      headers: {}, // fetch automatically sets boundary when body is FormData
    })
  },

  /**
   * Employee account activation signup
   */
  async signupEmployee(data) {
    return await apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, data)
  },

  /**
   * Login using login (email or employeeId) & password
   */
  async login(loginData) {
    return await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, loginData)
  },

  /**
   * Password change (JWT authenticated)
   */
  async changePassword(passwordData) {
    return await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData)
  },

  /**
   * Refresh token
   */
  async refreshToken() {
    return await apiClient.post(API_ENDPOINTS.AUTH.REFRESH)
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
