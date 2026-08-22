import { apiClient } from '@/services/api/apiClient'

export const attendanceService = {
  /**
   * Get real current attendance state for logged in user
   */
  async getTodayStatus() {
    try {
      const response = await apiClient.get('/attendance/today')
      return response?.data || response
    } catch (error) {
      throw error
    }
  },

  /**
   * Check in
   */
  async checkIn() {
    try {
      const response = await apiClient.post('/attendance/check-in')
      return response?.data || response
    } catch (error) {
      throw error
    }
  },

  /**
   * Check out
   */
  async checkOut() {
    try {
      const response = await apiClient.post('/attendance/check-out')
      return response?.data || response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get attendance logs
   */
  async getAttendanceLogs(filters = {}) {
    try {
      const query = new URLSearchParams(filters).toString()
      const response = await apiClient.get(`/attendance/logs?${query}`)
      if (Array.isArray(response)) return response
      if (Array.isArray(response?.data)) return response.data
      return []
    } catch (error) {
      throw error
    }
  },
}
