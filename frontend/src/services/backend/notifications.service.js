import { apiClient } from '@/services/api/apiClient'

let MOCK_NOTIFICATIONS = [
  {
    id: 'n_1',
    title: 'Leave Request Approved',
    message: 'Your Paid Leave request for March 10 - March 12 has been approved by Alexandra Vance.',
    time: '15 mins ago',
    type: 'LEAVE',
    read: false,
  },
  {
    id: 'n_2',
    title: 'Attendance Reminder',
    message: 'Don\'t forget to punch out at the end of your shift today.',
    time: '2 hours ago',
    type: 'ATTENDANCE',
    read: false,
  },
  {
    id: 'n_3',
    title: 'January Payslip Available',
    message: 'Your January 2026 salary payslip is now ready for download.',
    time: '1 day ago',
    type: 'PAYROLL',
    read: true,
  },
]

export const notificationsService = {
  async getNotifications() {
    try {
      const response = await apiClient.get('/notifications')
      return response?.data || response
    } catch {
      return MOCK_NOTIFICATIONS
    }
  },

  async markAsRead(id) {
    try {
      return await apiClient.patch(`/notifications/${id}/read`)
    } catch {
      MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      return { success: true }
    }
  },
}
