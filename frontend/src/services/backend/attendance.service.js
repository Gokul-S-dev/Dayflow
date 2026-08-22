import { apiClient } from '@/services/api/apiClient'

let attendanceState = {
  isCheckedIn: true,
  checkInTime: '09:02 AM',
  checkOutTime: null,
  workDuration: '4h 15m',
  status: 'PRESENT',
}

const MOCK_ATTENDANCE_LOGS = [
  { id: 'att_01', date: '2026-02-20', employeeName: 'Eleanor Morgan', department: 'Engineering', checkIn: '09:02 AM', checkOut: '06:05 PM', hours: '8.5', status: 'PRESENT' },
  { id: 'att_02', date: '2026-02-20', employeeName: 'Marcus Chen', department: 'Human Resources', checkIn: '08:55 AM', checkOut: '05:30 PM', hours: '8.0', status: 'PRESENT' },
  { id: 'att_03', date: '2026-02-20', employeeName: 'Devon Kovac', department: 'Engineering', checkIn: '10:15 AM', checkOut: '06:30 PM', hours: '7.25', status: 'HALF_DAY' },
  { id: 'att_04', date: '2026-02-20', employeeName: 'Amina Larsson', department: 'Operations', checkIn: '—', checkOut: '—', hours: '0.0', status: 'LEAVE' },
  { id: 'att_05', date: '2026-02-20', employeeName: 'Priya Sharma', department: 'Finance', checkIn: '09:00 AM', checkOut: '05:45 PM', hours: '8.25', status: 'PRESENT' },
]

export const attendanceService = {
  /**
   * Get current user attendance state
   */
  async getTodayStatus() {
    try {
      const response = await apiClient.get('/attendance/today')
      return response?.data || response
    } catch {
      return attendanceState
    }
  },

  /**
   * Perform Check In
   */
  async checkIn() {
    try {
      const response = await apiClient.post('/attendance/check-in')
      return response?.data || response
    } catch {
      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      attendanceState = {
        isCheckedIn: true,
        checkInTime: timeStr,
        checkOutTime: null,
        workDuration: '0h 01m',
        status: 'PRESENT',
      }
      return { success: true, message: `Checked in successfully at ${timeStr}`, data: attendanceState }
    }
  },

  /**
   * Perform Check Out
   */
  async checkOut() {
    try {
      const response = await apiClient.post('/attendance/check-out')
      return response?.data || response
    } catch {
      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      attendanceState = {
        ...attendanceState,
        isCheckedIn: false,
        checkOutTime: timeStr,
      }
      return { success: true, message: `Checked out successfully at ${timeStr}`, data: attendanceState }
    }
  },

  /**
   * Get attendance logs for employee or admin
   */
  async getAttendanceLogs(filters = {}) {
    try {
      const query = new URLSearchParams(filters).toString()
      const response = await apiClient.get(`/attendance/logs?${query}`)
      return response?.data || response
    } catch {
      return MOCK_ATTENDANCE_LOGS
    }
  },
}
