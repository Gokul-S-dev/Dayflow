import { leaveService } from '@/services/backend/leave.service'

export const odooLeave = {
  getLeaveBalances: () => leaveService.getLeaveBalances(),
  getLeaveRequests: (statusFilter) => leaveService.getLeaveRequests(statusFilter),
  createLeaveRequest: (data) => leaveService.applyLeave(data),
  approveLeave: (id, remarks) => leaveService.approveLeave(id, remarks),
  rejectLeave: (id, remarks) => leaveService.rejectLeave(id, remarks),
}
