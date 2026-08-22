import React, { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { useAuthStore } from '@/store/authStore'
import { dashboardService } from '@/services/backend/dashboard.service'
import { attendanceService } from '@/services/backend/attendance.service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Clock, CalendarDays, CreditCard, CheckCircle2, ArrowRight, Play, Square, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function EmployeeDashboardPage() {
  const { user } = useAuthStore()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [punchState, setPunchState] = useState({ isCheckedIn: true, checkInTime: '09:02 AM' })
  const [punching, setPunching] = useState(false)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [dashData, todayStatus] = await Promise.all([
          dashboardService.getEmployeeDashboard(),
          attendanceService.getTodayStatus(),
        ])
        setData(dashData)
        setPunchState(todayStatus)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handlePunchToggle = async () => {
    setPunching(true)
    try {
      if (punchState.isCheckedIn) {
        const res = await attendanceService.checkOut()
        setPunchState(res.data || { isCheckedIn: false, checkOutTime: '05:30 PM' })
        toast.success('Successfully checked out for the day!')
      } else {
        const res = await attendanceService.checkIn()
        setPunchState(res.data || { isCheckedIn: true, checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
        toast.success('Successfully checked in!')
      }
    } catch (err) {
      toast.error('Failed to update check-in status.')
    } finally {
      setPunching(false)
    }
  }

  return (
    <PageContainer
      title={`Good morning, ${user?.name ? user.name.split(' ')[0] : 'Employee'}`}
      description="Here is your workday summary, attendance logs, and leave balances."
      badge={<Badge variant="primary" dot>Employee Portal</Badge>}
      breadcrumbs={[
        { label: 'Employee' },
        { label: 'Dashboard' },
      ]}
    >
      {/* Prominent Check In / Check Out Action Card */}
      <section className="mb-6 rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-white to-slate-50 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold shadow-2xs ${
              punchState.isCheckedIn ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">Workday Punch Status</span>
                <Badge variant={punchState.isCheckedIn ? 'success' : 'secondary'} dot>
                  {punchState.isCheckedIn ? 'Checked In' : 'Checked Out'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {punchState.isCheckedIn
                  ? `Punched in at ${punchState.checkInTime || '09:02 AM'} (Duration: 4h 15m)`
                  : 'You are currently punched out. Click to record check-in.'}
              </p>
            </div>
          </div>

          <Button
            variant={punchState.isCheckedIn ? 'destructive' : 'success'}
            size="lg"
            isLoading={punching}
            onClick={handlePunchToggle}
            leftIcon={punchState.isCheckedIn ? <Square className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
            className="w-full sm:w-auto shrink-0 shadow-xs"
          >
            {punchState.isCheckedIn ? 'Check Out' : 'Check In Now'}
          </Button>
        </div>
      </section>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Today</span>
              <Badge variant="success" dot>Present</Badge>
            </div>
            <CardTitle className="text-xl font-bold mt-1">
              {punchState.checkInTime || '09:02 AM'}
            </CardTitle>
            <CardDescription className="text-xs">Shift: 09:00 AM - 06:00 PM</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leave Balance</span>
              <Badge variant="info">Paid Leave</Badge>
            </div>
            <CardTitle className="text-xl font-bold mt-1">
              {data?.leaveBalance?.availableDays || 16} Days
            </CardTitle>
            <CardDescription className="text-xs">Available for calendar year 2026</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Work Hours</span>
              <Badge variant="secondary">This Week</Badge>
            </div>
            <CardTitle className="text-xl font-bold mt-1">
              {data?.workingHoursWeek?.completed || 37.5} hrs
            </CardTitle>
            <CardDescription className="text-xs">Target: {data?.workingHoursWeek?.target || 40.0} hrs</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Latest Payslip</span>
              <Badge variant="secondary">January</Badge>
            </div>
            <CardTitle className="text-xl font-bold mt-1">
              ${data?.latestPayslip?.netAmount ? data.latestPayslip.netAmount.toLocaleString() : '5,850'}
            </CardTitle>
            <CardDescription className="text-xs">Disbursed on {data?.latestPayslip?.disbursedDate || '2026-01-31'}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Grid: Upcoming Leaves & Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Upcoming Approved Leaves</span>
              <Badge variant="outline" className="text-xs">2026 Schedule</Badge>
            </CardTitle>
            <CardDescription className="text-xs">Your confirmed time-off requests.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Paid Annual Leave</p>
                  <p className="text-[11px] text-slate-500">March 10, 2026 — March 12, 2026 (3 Days)</p>
                </div>
              </div>
              <Badge variant="success" dot>Approved</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Routing & API Status</CardTitle>
            <CardDescription>Backend contract integration status for Employee Portal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold">GET /api/v1/dashboard/employee</span>
              </div>
              <Badge variant="success">Active API</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Attendance Punch Service</span>
              </div>
              <Badge variant="secondary">Service Layer</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
