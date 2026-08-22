import { attendanceService } from '@/services/backend/attendance.service'

export const odooAttendance = {
  getCurrentAttendance: () => attendanceService.getTodayStatus(),
  getAttendanceRecords: (filters) => attendanceService.getAttendanceLogs(filters),
  checkIn: () => attendanceService.checkIn(),
  checkOut: () => attendanceService.checkOut(),
}
