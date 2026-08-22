import { apiClient } from '@/services/api/apiClient'

export const dashboardService = {
  /**
   * GET /api/v1/dashboard/employee
   */
  async getEmployeeDashboard() {
    try {
      const response = await apiClient.get('/dashboard/employee')
      return response?.data || response
    } catch (error) {
      throw error
    }
  },

  /**
   * GET /api/v1/dashboard/admin
   */
  async getAdminDashboard() {
    try {
      const response = await apiClient.get('/dashboard/admin')
      return response?.data || response
    } catch (error) {
      throw error
    }
  },
}
