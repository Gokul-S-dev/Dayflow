import React, { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { attendanceService } from '@/services/backend/attendance.service'
import { leaveService } from '@/services/backend/leave.service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Clock, Play, Square, ChevronLeft, ChevronRight, CheckCircle2, CalendarDays, Coffee, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function EmployeeAttendancePage() {
  const [logs, setLogs] = useState([])
  const [statusState, setStatusState] = useState({ isCheckedIn: false, checkInTime: null, checkOutTime: null })
  const [punching, setPunching] = useState(false)
  
  // Month pagination state
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [leaveCount, setLeaveCount] = useState(0)

  const currentMonth = selectedDate.getMonth()
  const currentYear = selectedDate.getFullYear()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const loadAttendance = async () => {
    try {
      const [dataLogs, today, leaves] = await Promise.all([
        attendanceService.getAttendanceLogs(),
        attendanceService.getTodayStatus(),
        leaveService.getLeaveRequests()
      ])
      setLogs(dataLogs)
      setStatusState(today)

      // Calculate approved leaves in the selected month
      const monthLeaves = leaves.filter(lv => {
        if (lv.status !== 'APPROVED') return false
        const start = new Date(lv.startDate)
        return start.getMonth() === currentMonth && start.getFullYear() === currentYear
      })
      
      const totalLeaves = monthLeaves.reduce((acc, curr) => acc + (curr.duration || 1), 0)
      setLeaveCount(totalLeaves)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadAttendance()
  }, [currentMonth, currentYear])

  const handlePunch = async () => {
    setPunching(true)
    try {
      if (statusState.isCheckedIn) {
        const res = await attendanceService.checkOut()
        setStatusState({
          isCheckedIn: false,
          checkInTime: res.data?.checkInTime || statusState.checkInTime,
          checkOutTime: res.data?.checkOutTime || '05:30 PM'
        })
        toast.success('Punched out successfully!')
      } else {
        const res = await attendanceService.checkIn()
        setStatusState({
          isCheckedIn: true,
          checkInTime: res.data?.checkInTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          checkOutTime: null
        })
        toast.success('Punched in successfully!')
      }
      await loadAttendance()
    } catch (err) {
      toast.error(err.message || 'Failed to update punch status.')
    } finally {
      setPunching(false)
    }
  }

  // Work hours formula parser
  const parseTime = (timeStr, dateStr) => {
    if (!timeStr || timeStr === '—' || timeStr === null) return null
    try {
      const cleanTime = timeStr.trim()
      const parts = cleanTime.match(/(\d+):(\d+)\s*(AM|PM)?/i)
      if (!parts) return null
      
      let hours = parseInt(parts[1], 10)
      const minutes = parseInt(parts[2], 10)
      const ampm = parts[3] ? parts[3].toUpperCase() : null

      if (ampm === 'PM' && hours < 12) hours += 12
      if (ampm === 'AM' && hours === 12) hours = 0

      const d = new Date(dateStr)
      d.setHours(hours, minutes, 0, 0)
      return d
    } catch (e) {
      return null
    }
  }

  const calculateHours = (checkInStr, checkOutStr, dateStr) => {
    const inTime = parseTime(checkInStr, dateStr)
    const outTime = parseTime(checkOutStr, dateStr)
    if (!inTime || !outTime) return { hours: 0, extra: 0 }

    const diffMs = outTime - inTime
    const diffHours = diffMs / (1000 * 60 * 60)

    // Deduct standard 1 hour lunch break
    const workHours = Math.max(0, diffHours - 1)
    // 8 hours standard work day, remainder is extra/overtime
    const extraHours = Math.max(0, workHours - 8)

    return {
      hours: parseFloat(workHours.toFixed(1)),
      extra: parseFloat(extraHours.toFixed(1))
    }
  }

  const handlePrevMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const handleMonthChange = (e) => {
    setSelectedDate(new Date(currentYear, parseInt(e.target.value, 10), 1))
  }

  // Filter logs for selected month
  const filteredLogs = logs.filter(log => {
    if (!log.date) return false
    const d = new Date(log.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  // Count present days
  const presentDaysCount = filteredLogs.filter(log => log.status === 'CHECKED_OUT' || log.status === 'CHECKED_IN').length

  // Calculate weekdays/working days in the selected month
  const getWorkingDaysInMonth = (month, year) => {
    let count = 0
    const d = new Date(year, month, 1)
    while (d.getMonth() === month) {
      const day = d.getDay()
      if (day !== 0 && day !== 6) { // Mon-Fri
        count++
      }
      d.setDate(d.getDate() + 1)
    }
    return count
  }

  const totalWorkingDays = getWorkingDaysInMonth(currentMonth, currentYear)

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CHECKED_OUT':
        return <Badge variant="success" dot>Completed</Badge>
      case 'CHECKED_IN':
        return <Badge variant="warning" dot>Punched In</Badge>
      case 'ABSENT':
        return <Badge variant="destructive" dot>Absent</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <PageContainer
      title="Attendance Logs"
      description="View working hours, log attendance, and navigate calendar schedules."
      badge={<Badge variant="secondary">Attendance Hub</Badge>}
      breadcrumbs={[
        { label: 'Portal' },
        { label: 'Attendance' },
      ]}
    >
      {/* 3 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white border-slate-200 shadow-xs border-l-4 border-l-purple-600">
          <CardHeader className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Days Present</span>
            <CardTitle className="text-2xl font-bold mt-1 text-slate-900">{presentDaysCount}</CardTitle>
            <CardDescription className="text-xs">Punched record in {monthNames[currentMonth]}</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-white border-slate-200 shadow-xs border-l-4 border-l-amber-500">
          <CardHeader className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">On Leave</span>
            <CardTitle className="text-2xl font-bold mt-1 text-amber-700">{leaveCount}</CardTitle>
            <CardDescription className="text-xs">Approved leaves this month</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-white border-slate-200 shadow-xs border-l-4 border-l-blue-600">
          <CardHeader className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Working Days</span>
            <CardTitle className="text-2xl font-bold mt-1 text-blue-700">{totalWorkingDays}</CardTitle>
            <CardDescription className="text-xs">Weekdays available in month</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Punch Action Card */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold ${
              statusState.isCheckedIn ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Current Attendance Log</span>
              <p className="text-sm font-bold text-slate-900">
                {statusState.isCheckedIn ? `Checked In since ${statusState.checkInTime || '--:--'}` : 'Offline / Punched Out'}
              </p>
            </div>
          </div>

          <Button
            variant={statusState.isCheckedIn ? 'destructive' : 'success'}
            size="sm"
            isLoading={punching}
            onClick={handlePunch}
            leftIcon={statusState.isCheckedIn ? <Square className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
          >
            {statusState.isCheckedIn ? 'Punch Check Out' : 'Punch Check In'}
          </Button>
        </div>
      </section>

      {/* Table Card */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base text-slate-900">Month Logs</CardTitle>
              <CardDescription>Review working hours, lunch break deductions, and overtime duration.</CardDescription>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevMonth} className="px-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <select
                className="flex h-9 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600 font-semibold"
                value={currentMonth}
                onChange={handleMonthChange}
              >
                {monthNames.map((m, idx) => (
                  <option key={idx} value={idx}>{m} {currentYear}</option>
                ))}
              </select>

              <Button variant="outline" size="sm" onClick={handleNextMonth} className="px-2">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-100">
              <TableRow>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Check In</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Check Out</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Work Hours (-1h Break)</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Extra Hours</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const calcs = calculateHours(log.checkIn, log.checkOut, log.date)
                return (
                  <TableRow key={log.id} className="border-b border-slate-100">
                    <TableCell className="font-semibold text-slate-800 text-xs">{new Date(log.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</TableCell>
                    <TableCell className="text-xs text-slate-600 font-medium">{log.checkIn || '—'}</TableCell>
                    <TableCell className="text-xs text-slate-600 font-medium">{log.checkOut || '—'}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-900 font-semibold">{calcs.hours} hrs</TableCell>
                    <TableCell className="font-mono text-xs text-purple-700 font-semibold">+{calcs.extra} hrs</TableCell>
                    <TableCell className="text-right">{getStatusBadge(log.status)}</TableCell>
                  </TableRow>
                )
              })}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    <AlertCircle className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                    No attendance punch records found for this month.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
