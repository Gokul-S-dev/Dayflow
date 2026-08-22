import React, { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { attendanceService } from '@/services/backend/attendance.service'
import { employeesService } from '@/services/backend/employees.service'
import { leaveService } from '@/services/backend/leave.service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Clock, Search, Filter, ChevronLeft, ChevronRight, AlertCircle, Calendar } from 'lucide-react'
import { toast } from 'sonner'

export function AdminAttendancePage() {
  const [employees, setEmployees] = useState([])
  const [logs, setLogs] = useState([])
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  
  // Daily selector
  const [selectedDate, setSelectedDate] = useState(new Date())

  const loadData = async () => {
    setLoading(true)
    try {
      const [empData, logsData, leavesData] = await Promise.all([
        employeesService.getEmployees(),
        attendanceService.getAttendanceLogs(),
        leaveService.getLeaveRequests().catch(() => [])
      ])
      setEmployees(empData)
      setLogs(logsData)
      setLeaves(leavesData)
    } catch (err) {
      toast.error('Failed to load daily attendance registry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Time utilities
  const parseTime = (timeStr, dateStr) => {
    if (!timeStr || timeStr === '—') return null
    try {
      const parts = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)?/i)
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

    const diffHours = (outTime - inTime) / (1000 * 60 * 60)
    const workHours = Math.max(0, diffHours - 1) // Deduct 1h break
    const extraHours = Math.max(0, workHours - 8)

    return {
      hours: parseFloat(workHours.toFixed(1)),
      extra: parseFloat(extraHours.toFixed(1))
    }
  }

  // Day navigation
  const handlePrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d)
  }

  const handleNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d)
  }

  const handleDateChange = (e) => {
    if (e.target.value) {
      setSelectedDate(new Date(e.target.value))
    }
  }

  // Compile daily roster status
  const selectedDateStr = selectedDate.toISOString().split('T')[0]

  const roster = employees.map((emp) => {
    // Look up attendance logs for this employee today
    const att = logs.find(
      (l) => (l.employeeId === emp.employeeId || l.employeeName === `${emp.firstName} ${emp.lastName}`) && l.date === selectedDateStr
    )

    // Look up approved leave requests for this employee today
    const onLeave = leaves.find((lv) => {
      if (lv.userId?._id !== emp.id && lv.userId !== emp.id) return false
      if (lv.status !== 'APPROVED') return false
      const start = new Date(lv.startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(lv.endDate)
      end.setHours(23, 59, 59, 999)
      return selectedDate >= start && selectedDate <= end
    })

    let status = 'ABSENT'
    if (att) {
      status = att.status === 'CHECKED_IN' ? 'PRESENT_IN' : 'PRESENT_OUT'
    } else if (onLeave) {
      status = 'LEAVE'
    }

    const calcs = att ? calculateHours(att.checkIn, att.checkOut, selectedDateStr) : { hours: 0, extra: 0 }

    return {
      id: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeId: emp.employeeId,
      department: emp.department || 'Engineering',
      checkIn: att ? att.checkIn : '—',
      checkOut: att ? att.checkOut : '—',
      workHours: calcs.hours,
      extraHours: calcs.extra,
      status,
    }
  })

  // Apply filters
  const filteredRoster = roster.filter((item) => {
    const textMatch = item.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(search.toLowerCase())

    const deptMatch = deptFilter === 'ALL' || item.department === deptFilter

    let statusMatch = true
    if (statusFilter === 'PRESENT') {
      statusMatch = item.status === 'PRESENT_IN' || item.status === 'PRESENT_OUT'
    } else if (statusFilter === 'LEAVE') {
      statusMatch = item.status === 'LEAVE'
    } else if (statusFilter === 'ABSENT') {
      statusMatch = item.status === 'ABSENT'
    }

    return textMatch && deptMatch && statusMatch
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT_OUT':
        return <Badge variant="success" dot>Completed</Badge>
      case 'PRESENT_IN':
        return <Badge variant="warning" dot>Punched In</Badge>
      case 'LEAVE':
        return <Badge variant="primary" dot>On Leave</Badge>
      case 'ABSENT':
      default:
        return <Badge variant="destructive" dot>Absent</Badge>
    }
  }

  // Format visual header text
  const isToday = new Date().toDateString() === selectedDate.toDateString()
  const displayDateText = selectedDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  const displayDayText = selectedDate.toLocaleDateString('en-IN', {
    weekday: 'long'
  })

  return (
    <PageContainer
      title="Daily Attendance Registry"
      description="Monitor real-time check-in logs, work hours, and workforce availability."
      badge={<Badge variant="secondary">{isToday ? 'Today' : 'Archive'}</Badge>}
      breadcrumbs={[
        { label: 'Admin' },
        { label: 'Daily Roster' },
      ]}
    >
      {/* Date controls and filters */}
      <Card className="mb-6 bg-white border-slate-200 shadow-xs">
        <CardContent className="p-4 space-y-4">
          {/* Main date selectors */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handlePrevDay} className="px-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center sm:text-left">
                <h3 className="text-sm font-bold text-slate-800">{isToday ? 'Today, ' : ''}{displayDateText}</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{displayDayText}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleNextDay} className="px-2" disabled={isToday}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="date"
                value={selectedDateStr}
                max={new Date().toISOString().split('T')[0]}
                onChange={handleDateChange}
                className="flex h-9 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Roster filter inputs */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4 text-slate-400" />}
                className="bg-white border-slate-200 text-xs text-slate-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="flex h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="LEAVE">On Leave</option>
                <option value="ABSENT">Absent</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily workforce table */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            <span>Workforce Availability Log</span>
          </CardTitle>
          <CardDescription>Shift logs for {displayDateText}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-100">
              <TableRow>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Employee Name</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Employee ID</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Department</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Check In</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Check Out</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Work Hours</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Overtime</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    Loading daily log feeds...
                  </TableCell>
                </TableRow>
              ) : filteredRoster.map((item) => (
                <TableRow key={item.id} className="border-b border-slate-100">
                  <TableCell className="font-semibold text-slate-900 text-xs">{item.employeeName}</TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium font-mono">{item.employeeId}</TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium">{item.department}</TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium">{item.checkIn}</TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium">{item.checkOut}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-900 font-semibold">{item.workHours > 0 ? `${item.workHours} hrs` : '—'}</TableCell>
                  <TableCell className="font-mono text-xs text-purple-700 font-semibold">{item.extraHours > 0 ? `+${item.extraHours} hrs` : '—'}</TableCell>
                  <TableCell className="text-right">{getStatusBadge(item.status)}</TableCell>
                </TableRow>
              ))}
              {!loading && filteredRoster.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    <AlertCircle className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                    No employees matching filters found on this day.
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
