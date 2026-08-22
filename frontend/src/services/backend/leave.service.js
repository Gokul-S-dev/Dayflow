import { apiClient } from '@/services/api/apiClient'

export const leaveService = {
  /**
   * Get leave balances for employee
   */
  async getLeaveBalances() {
    try {
      const response = await apiClient.get('/leave/balances')
      return response?.data || response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get leave requests
   */
  async getLeaveRequests(statusFilter = 'ALL') {
    try {
      const response = await apiClient.get(`/leave/requests?status=${statusFilter}`)
      if (Array.isArray(response)) return response
      if (Array.isArray(response?.data)) return response.data
      return []
    } catch (error) {
      throw error
    }
  },

  /**
   * Apply for leave
   */
  async applyLeave(leaveData) {
    try {
      return await apiClient.post('/leave/apply', leaveData)
    } catch (error) {
      throw error
    }
  },

  /**
   * Approve leave
   */
  async approveLeave(requestId, remarks = '') {
    try {
      return await apiClient.patch(`/leave/requests/${requestId}/approve`, { remarks })
    } catch (error) {
      throw error
    }
  },

  /**
   * Reject leave
   */
  async rejectLeave(requestId, remarks = '') {
    try {
      return await apiClient.patch(`/leave/requests/${requestId}/reject`, { remarks })
    } catch (error) {
      throw error
    }
  },
}
