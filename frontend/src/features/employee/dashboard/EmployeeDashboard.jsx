import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { useAuthStore } from '@/store/authStore'
import { odooEmployees } from '@/services/odoo/employees'
import { odooAttendance } from '@/services/odoo/attendance'
import { AttendanceControl } from './components/AttendanceControl'
import { EmployeeGrid } from './components/EmployeeGrid'
import { DashboardSkeleton } from './components/DashboardSkeleton'
import { DashboardEmptyState } from './components/DashboardEmptyState'
import { DashboardErrorState } from './components/DashboardErrorState'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Building2, Mail, Phone, Calendar, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

export function EmployeeDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [attendanceState, setAttendanceState] = useState(null)
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPunching, setIsPunching] = useState(false)
  const [error, setError] = useState(null)

  // View-only modal state for clicked employee card
  const [selectedEmp, setSelectedEmp] = useState(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [empList, todayAttendance] = await Promise.allSettled([
        odooEmployees.getEmployees(),
        odooAttendance.getCurrentAttendance(),
      ])

      if (empList.status === 'fulfilled') {
        setEmployees(Array.isArray(empList.value) ? empList.value : [])
      } else {
        setEmployees([])
      }

      if (todayAttendance.status === 'fulfilled') {
        setAttendanceState(todayAttendance.value || { isCheckedIn: false })
      } else {
        setAttendanceState({ isCheckedIn: false })
      }
    } catch (err) {
      setError(err.message || 'Unable to load employee information.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCheckIn = async () => {
    setIsPunching(true)
    try {
      const res = await odooAttendance.checkIn()
      toast.success(res?.message || 'Checked in successfully.')
      await loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to record check-in.')
    } finally {
      setIsPunching(false)
    }
  }

  const handleCheckOut = async () => {
    setIsPunching(true)
    try {
      const res = await odooAttendance.checkOut()
      toast.success(res?.message || 'Checked out successfully.')
      await loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to record check-out.')
    } finally {
      setIsPunching(false)
    }
  }

  if (isLoading) {
    return (
      <PageContainer title="Employee Dashboard" description="Loading real-time workday data...">
        <DashboardSkeleton />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer title="Employee Dashboard">
        <DashboardErrorState title="Unable to load employee information." description={error} onRetry={loadData} />
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={`Good morning, ${user?.name ? user.name.split(' ')[0] : 'Employee'}`}
      description="Workday dashboard, check-in punch control, and team attendance statuses."
      badge={<Badge variant="primary" dot>Employee Portal</Badge>}
      breadcrumbs={[
        { label: 'Portal' },
        { label: 'Employee Dashboard' },
      ]}
    >
      <div className="space-y-6">
        {/* Attendance Control */}
        <AttendanceControl
          attendanceState={attendanceState}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          isLoading={isPunching}
        />

        {/* Employee Cards Grid Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-700" />
              <span>Team Members & Attendance Status</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">{employees.length} Records</span>
          </div>

          <EmployeeGrid
            employees={employees}
            onSelectEmployee={(emp) => setSelectedEmp(emp)}
          />
        </div>
      </div>

      {/* View-Only Employee Information Dialog */}
      {selectedEmp && (
        <Dialog open={!!selectedEmp} onOpenChange={() => setSelectedEmp(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <Avatar size="lg">
                  <AvatarFallback className="bg-blue-700 text-white font-bold text-sm">
                    {(selectedEmp.fullName || selectedEmp.name || 'E')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-base font-bold text-slate-900">
                    {selectedEmp.fullName || `${selectedEmp.firstName || ''} ${selectedEmp.lastName || ''}`.trim() || selectedEmp.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-semibold text-blue-700">
                    {selectedEmp.designation || 'Staff Member'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee ID:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedEmp.id || selectedEmp.employeeId || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-semibold text-slate-800">{selectedEmp.department || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800">{selectedEmp.email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold text-slate-800">{selectedEmp.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Joining Date:</span>
                  <span className="font-semibold text-slate-800">{selectedEmp.joiningDate || 'Not provided'}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-md bg-blue-50 border border-blue-200 text-[11px] text-blue-800 text-center font-medium">
                View-Only Mode (Employee Directory interaction)
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </PageContainer>
  )
}
