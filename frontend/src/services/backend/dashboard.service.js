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
      console.warn('Employee dashboard API unavailable, using mock metrics:', error.message)
      return {
        attendanceToday: {
          status: 'PRESENT',
          checkIn: '09:02 AM',
          checkOut: null,
          workHours: '4h 15m',
        },
        workingHoursWeek: {
          completed: 37.5,
          target: 40.0,
        },
        leaveBalance: {
          availableDays: 16,
          usedDays: 4,
          pendingRequests: 1,
        },
        latestPayslip: {
          period: 'January 2026',
          netAmount: 5850.0,
          status: 'DISBURSED',
          disbursedDate: '2026-01-31',
        },
        upcomingLeaves: [
          { id: 'l1', type: 'Paid Leave', startDate: '2026-03-10', endDate: '2026-03-12', status: 'APPROVED' },
        ],
      }
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
      console.warn('Admin dashboard API unavailable, using mock metrics:', error.message)
      return {
        kpis: {
          totalEmployees: 142,
          presentToday: 134,
          onLeaveToday: 5,
          absentToday: 3,
          pendingApprovals: 5,
        },
        attendanceTrend: [
          { day: 'Mon', present: 138, absent: 2, leave: 2 },
          { day: 'Tue', present: 136, absent: 3, leave: 3 },
          { day: 'Wed', present: 140, absent: 1, leave: 1 },
          { day: 'Thu', present: 134, absent: 4, leave: 4 },
          { day: 'Fri', present: 132, absent: 5, leave: 5 },
        ],
        leaveDistribution: [
          { name: 'Paid Leave', value: 45, color: '#2563eb' },
          { name: 'Sick Leave', value: 20, color: '#f59e0b' },
          { name: 'Unpaid Leave', value: 10, color: '#ef4444' },
        ],
        departmentAttendance: [
          { department: 'Engineering', rate: 96.5 },
          { department: 'Human Resources', rate: 98.0 },
          { department: 'Operations', rate: 92.1 },
          { department: 'Finance', rate: 95.4 },
          { department: 'Design', rate: 94.0 },
        ],
        recentActivities: [
          { id: 'act1', user: 'Eleanor Morgan', action: 'Checked in at 09:02 AM', time: '10 mins ago', type: 'ATTENDANCE' },
          { id: 'act2', user: 'Marcus Chen', action: 'Submitted Sick Leave request', time: '25 mins ago', type: 'LEAVE' },
          { id: 'act3', user: 'Alexandra Vance', action: 'Approved annual leave for Amina Larsson', time: '1 hour ago', type: 'APPROVAL' },
        ],
      }
    }
  },
}
