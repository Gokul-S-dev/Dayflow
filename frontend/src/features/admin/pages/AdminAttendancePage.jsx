import React, { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { attendanceService } from '@/services/backend/attendance.service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Clock, Search, Filter, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'

export function AdminAttendancePage() {
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')
  
  // Date selection state
  const [selectedDate, setSelectedDate] = useState(new Date())
  const currentMonth = selectedDate.getMonth()
  const currentYear = selectedDate.getFullYear()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await attendanceService.getAttendanceLogs()
        setLogs(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadLogs()
  }, [])

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

    // Deduct standard 1 hour break
    const workHours = Math.max(0, diffHours - 1)
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

  // Filter logs by search, department, and month pagination
  const filteredLogs = logs.filter((log) => {
    const nameMatch = (log.employeeName || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.employeeId || '').toLowerCase().includes(search.toLowerCase())
    
    const dept = log.department || 'Engineering' // Fallback
    const deptMatch = deptFilter === 'ALL' || dept === deptFilter

    // Filter by selected month
    if (!log.date) return false
    const logDate = new Date(log.date)
    const dateMatch = logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear

    return nameMatch && deptMatch && dateMatch
  })

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
      title="Company Attendance Oversight"
      description="Monitor punch card details, shift durations, and overtime across your workforce."
      badge={<Badge variant="secondary">Admin Center</Badge>}
      breadcrumbs={[
        { label: 'Admin' },
        { label: 'Attendance oversight' },
      ]}
    >
      {/* Search & Department Selector & Date Controls */}
      <Card className="mb-6 bg-white border-slate-200 shadow-xs">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="w-full sm:w-64">
              <Input
                placeholder="Filter by employee name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4 text-slate-400" />}
                className="bg-white border-slate-200 text-xs text-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
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
            </div>
          </div>

          {/* Month pagination controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth} className="px-2">
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <select
              className="flex h-9 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-900 focus:outline-none font-semibold"
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
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            <span>Attendance Log Feed</span>
          </CardTitle>
          <CardDescription>Daily punch logs and shift duration summary.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-100">
              <TableRow>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Employee Name</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Employee ID</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Check In</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Check Out</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Work Hours</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider">Overtime</TableHead>
                <TableHead className="text-xs text-slate-500 font-bold uppercase tracking-wider text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const calcs = calculateHours(log.checkIn, log.checkOut, log.date)
                return (
                  <TableRow key={log.id} className="border-b border-slate-100">
                    <TableCell className="font-semibold text-slate-900 text-xs">{log.employeeName}</TableCell>
                    <TableCell className="text-xs text-slate-600 font-medium">{log.employeeId || '—'}</TableCell>
                    <TableCell className="text-xs text-slate-600 font-medium">{new Date(log.date).toLocaleDateString()}</TableCell>
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
                  <TableCell colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    <AlertCircle className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                    No attendance logs found matching search criteria.
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
