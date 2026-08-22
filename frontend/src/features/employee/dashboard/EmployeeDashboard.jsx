import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { useAuthStore } from '@/store/authStore'
import { odooEmployees } from '@/services/odoo/employees'
import { odooAttendance } from '@/services/odoo/attendance'
import { dashboardService } from '@/services/backend/dashboard.service'
import { AttendanceControl } from './components/AttendanceControl'
import { EmployeeGrid } from './components/EmployeeGrid'
import { DashboardSkeleton } from './components/DashboardSkeleton'
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
import { Building2, Mail, Phone, Calendar, UserCheck, Clock, FileText, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/features/payroll/utils/salaryCalculator'

export function EmployeeDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [dashboardData, setDashboardData] = useState(null)
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
      const [dashRes, empListRes] = await Promise.allSettled([
        dashboardService.getEmployeeDashboard(),
        odooEmployees.getEmployees(),
      ])

      if (dashRes.status === 'fulfilled') {
        setDashboardData(dashRes.value)
        setAttendanceState(dashRes.value.attendance)
      } else {
        throw new Error(dashRes.reason?.message || 'Failed to load employee dashboard data.')
      }

      if (empListRes.status === 'fulfilled') {
        setEmployees(Array.isArray(empListRes.value) ? empListRes.value : [])
      } else {
        setEmployees([])
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

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const d = new Date(timeStr)
    if (isNaN(d.getTime())) return timeStr
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const calculateHours = (inStr, outStr) => {
    if (!inStr || !outStr) return '0 hrs'
    const diffMs = new Date(outStr) - new Date(inStr)
    if (isNaN(diffMs) || diffMs < 0) return '0 hrs'
    const diffHrs = diffMs / (1000 * 60 * 60)
    return `${diffHrs.toFixed(1)} hrs`
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

  const profile = dashboardData?.profile || {}
  const leaves = dashboardData?.leave || {}
  const recentActivity = dashboardData?.recentActivity || []

  return (
    <PageContainer
      title={`Good morning, ${profile.name ? profile.name.split(' ')[0] : 'Employee'}`}
      description={`Workday portal for ${profile.name || 'Staff'} (ID: ${profile.id || 'N/A'})`}
      badge={<Badge variant="purple" dot>Employee Portal</Badge>}
      breadcrumbs={[
        { label: 'Portal' },
        { label: 'Employee Dashboard' },
      ]}
    >
      <div className="space-y-6">
        {/* Attendance Punch Control */}
        <AttendanceControl
          attendanceState={attendanceState}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          isLoading={isPunching}
        />

        {/* Dashboard Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Today's Shift */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-purple-600" />
                <span>Today's Shift</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-1 text-sm text-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <Badge variant={attendanceState?.status === 'CHECKED_IN' ? 'success' : 'secondary'}>
                  {attendanceState?.status || 'NOT PUNCHED'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Check In:</span>
                <span className="font-semibold">{attendanceState?.checkInTime ? formatTime(attendanceState.checkInTime) : '--:--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Check Out:</span>
                <span className="font-semibold">{attendanceState?.checkOutTime ? formatTime(attendanceState.checkOutTime) : '--:--'}</span>
              </div>
              {attendanceState?.checkInTime && attendanceState?.checkOutTime && (
                <div className="flex justify-between pt-1.5 border-t border-slate-100">
                  <span className="text-slate-500">Work Hours:</span>
                  <span className="font-bold text-slate-900">{calculateHours(attendanceState.checkInTime, attendanceState.checkOutTime)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Time Off Summary */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-purple-600" />
                <span>Leave Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-1 text-sm text-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Pending Requests:</span>
                <span className="font-bold text-amber-600">{leaves.pending || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Approved Leave:</span>
                <span className="font-bold text-emerald-600">{leaves.approved || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rejected Leave:</span>
                <span className="font-bold text-red-600">{leaves.rejected || 0}</span>
              </div>
              <Link to="/attendance" className="block text-xs font-semibold text-purple-600 hover:text-purple-750 hover:underline pt-0.5">
                Apply for leave / View Balances →
              </Link>
            </CardContent>
          </Card>

          {/* Card 3: Profile & Co */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-purple-600" />
                <span>Organization</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-1 text-xs text-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Company:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[150px]">{profile.company || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Official Email:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[150px]">{profile.email || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Role:</span>
                <span className="font-semibold text-slate-900">{profile.role || 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Joining Date:</span>
                <span className="font-semibold text-slate-900">{profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'Not set'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Feed */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span>Recent Activity Feed</span>
            </CardTitle>
            <CardDescription className="text-xs">Real-time workspace activity logs derived from backend operations.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentActivity.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400 font-semibold">No recent activity logged.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 px-6 text-xs hover:bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                      <span className="text-slate-800 font-semibold">{activity.message}</span>
                    </div>
                    <span className="text-slate-400 font-medium">
                      {new Date(activity.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee Cards Grid Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-purple-600" />
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
                  <AvatarFallback className="bg-purple-600 text-white font-bold text-sm">
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
                  <DialogDescription className="text-xs font-semibold text-purple-600">
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
                  <span className="font-semibold text-slate-800">{selectedEmp.joiningDate ? new Date(selectedEmp.joiningDate).toLocaleDateString() : 'Not provided'}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-md bg-purple-50 border border-purple-200 text-[11px] text-purple-800 text-center font-medium">
                View-Only Mode (Employee Directory interaction)
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </PageContainer>
  )
}
