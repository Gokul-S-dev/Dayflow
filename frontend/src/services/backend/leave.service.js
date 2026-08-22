import { apiClient } from '@/services/api/apiClient'

let MOCK_LEAVE_REQUESTS = [
  {
    id: 'l_101',
    employeeId: 'EMP-1002',
    employeeName: 'Marcus Chen',
    department: 'Human Resources',
    type: 'Sick Leave',
    startDate: '2026-03-02',
    endDate: '2026-03-03',
    days: 2,
    reason: 'Severe seasonal flu and medical rest',
    status: 'PENDING',
    appliedDate: '2026-02-21',
  },
  {
    id: 'l_102',
    employeeId: 'EMP-1004',
    employeeName: 'Amina Larsson',
    department: 'Operations',
    type: 'Paid Leave',
    startDate: '2026-03-10',
    endDate: '2026-03-14',
    days: 5,
    reason: 'Family vacation and personal travel',
    status: 'APPROVED',
    appliedDate: '2026-02-15',
    approvedBy: 'Alexandra Vance',
  },
  {
    id: 'l_103',
    employeeId: 'EMP-1005',
    employeeName: 'Devon Kovac',
    department: 'Engineering',
    type: 'Unpaid Leave',
    startDate: '2026-02-28',
    endDate: '2026-02-28',
    days: 1,
    reason: 'Relocation assistance and moving day',
    status: 'PENDING',
    appliedDate: '2026-02-20',
  },
  {
    id: 'l_104',
    employeeId: 'EMP-1001',
    employeeName: 'Eleanor Morgan',
    department: 'Engineering',
    type: 'Paid Leave',
    startDate: '2026-01-15',
    endDate: '2026-01-16',
    days: 2,
    reason: 'Annual health checkup and rest',
    status: 'APPROVED',
    appliedDate: '2026-01-05',
    approvedBy: 'Marcus Chen',
  },
]

export const leaveService = {
  /**
   * Get leave balances for employee
   */
  async getLeaveBalances() {
    try {
      const response = await apiClient.get('/leave/balances')
      return response?.data || response
    } catch {
      return {
        paid: { total: 20, used: 4, available: 16 },
        sick: { total: 10, used: 2, available: 8 },
        unpaid: { total: 15, used: 0, available: 15 },
      }
    }
  },

  /**
   * Get leave history (filtered for user or admin)
   */
  async getLeaveRequests(statusFilter = 'ALL') {
    try {
      const response = await apiClient.get(`/leave/requests?status=${statusFilter}`)
      return response?.data || response
    } catch {
      if (statusFilter === 'ALL') return MOCK_LEAVE_REQUESTS
      return MOCK_LEAVE_REQUESTS.filter((req) => req.status === statusFilter)
    }
  },

  /**
   * Apply for leave
   */
  async applyLeave(leaveData) {
    try {
      return await apiClient.post('/leave/apply', leaveData)
    } catch {
      const newRequest = {
        id: `l_${Date.now()}`,
        employeeId: 'EMP-1001',
        employeeName: 'Eleanor Morgan',
        department: 'Engineering',
        status: 'PENDING',
        appliedDate: new Date().toISOString().split('T')[0],
        ...leaveData,
      }
      MOCK_LEAVE_REQUESTS = [newRequest, ...MOCK_LEAVE_REQUESTS]
      return { success: true, message: 'Leave request submitted successfully.', data: newRequest }
    }
  },

  /**
   * Approve leave request (Admin/HR)
   */
  async approveLeave(requestId, remarks = '') {
    try {
      return await apiClient.patch(`/leave/requests/${requestId}/approve`, { remarks })
    } catch {
      MOCK_LEAVE_REQUESTS = MOCK_LEAVE_REQUESTS.map((req) =>
        req.id === requestId ? { ...req, status: 'APPROVED', approvedBy: 'Alexandra Vance', remarks } : req
      )
      return { success: true, message: 'Leave request approved.' }
    }
  },

  /**
   * Reject leave request (Admin/HR)
   */
  async rejectLeave(requestId, remarks = '') {
    try {
      return await apiClient.patch(`/leave/requests/${requestId}/reject`, { remarks })
    } catch {
      MOCK_LEAVE_REQUESTS = MOCK_LEAVE_REQUESTS.map((req) =>
        req.id === requestId ? { ...req, status: 'REJECTED', rejectedBy: 'Alexandra Vance', remarks } : req
      )
      return { success: true, message: 'Leave request rejected.' }
    }
  },
}
