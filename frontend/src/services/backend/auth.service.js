import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/constants/endpoints'

export const authService = {
  /**
   * Company signup with multipart logo upload (Content-Type: multipart/form-data)
   */
  async signupCompany(formData) {
    return await apiClient.post(API_ENDPOINTS.AUTH.SIGNUP_COMPANY, formData, {
      headers: {}, // fetch sets boundary automatically when body is FormData
    })
  },

  /**
   * Employee account activation (uses provisioned employeeId + email)
   */
  async signup(data) {
    return await apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, data)
  },

  /**
   * Login using `login` (email or employeeId) & password
   */
  async login(loginData) {
    return await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, loginData)
  },

  /**
   * Verify email with token from the verification link
   * GET /auth/verify-email?token=...
   */
  async verifyEmail(token) {
    return await apiClient.get(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`)
  },

  /**
   * Password change (JWT authenticated via Authorization header)
   */
  async changePassword(passwordData) {
    return await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData)
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken) {
    return await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken })
  },

  /**
   * Logout session (best-effort, always succeeds on frontend)
   */
  async logout() {
    try {
      return await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch {
      return { success: true }
    }
  },
}
