import React, { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { attendanceService } from '@/services/backend/attendance.service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Clock, Play, Square, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export function EmployeeAttendancePage() {
  const [logs, setLogs] = useState([])
  const [statusState, setStatusState] = useState({ isCheckedIn: true, checkInTime: '09:02 AM' })
  const [punching, setPunching] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    async function loadAttendance() {
      try {
        const [dataLogs, today] = await Promise.all([
          attendanceService.getAttendanceLogs(),
          attendanceService.getTodayStatus(),
        ])
        setLogs(dataLogs)
        setStatusState(today)
      } catch (err) {
        console.error(err)
      }
    }
    loadAttendance()
  }, [])

  const handlePunch = async () => {
    setPunching(true)
    try {
      if (statusState.isCheckedIn) {
        const res = await attendanceService.checkOut()
        setStatusState(res.data || { isCheckedIn: false, checkOutTime: '05:30 PM' })
        toast.success('Punched out successfully!')
      } else {
        const res = await attendanceService.checkIn()
        setStatusState(res.data || { isCheckedIn: true, checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
        toast.success('Punched in successfully!')
      }
    } catch (err) {
      toast.error('Failed to update status.')
    } finally {
      setPunching(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return <Badge variant="success" dot>Present</Badge>
      case 'HALF_DAY':
        return <Badge variant="warning" dot>Half Day</Badge>
      case 'LEAVE':
        return <Badge variant="info" dot>On Leave</Badge>
      case 'ABSENT':
        return <Badge variant="destructive" dot>Absent</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <PageContainer
      title="Attendance & Shift Logs"
      description="View daily punch history, calendar views, and working hour totals."
      badge={<Badge variant="success" dot>Realtime Sync</Badge>}
      breadcrumbs={[
        { label: 'Employee' },
        { label: 'Attendance' },
      ]}
    >
      {/* Punch Action Card */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold ${
              statusState.isCheckedIn ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Current Shift Status</span>
              <p className="text-sm font-bold text-slate-900">
                {statusState.isCheckedIn ? `Punched in since ${statusState.checkInTime || '09:02 AM'}` : 'Not Punched In'}
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
            {statusState.isCheckedIn ? 'Check Out' : 'Check In'}
          </Button>
        </div>
      </section>

      {/* Grid: History Table & Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Attendance History</CardTitle>
              <CardDescription>Daily check-in, check-out, and total calculated hours.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-semibold text-slate-800">{log.date}</TableCell>
                      <TableCell>{log.checkIn}</TableCell>
                      <TableCell>{log.checkOut}</TableCell>
                      <TableCell className="font-mono text-xs">{log.hours} hrs</TableCell>
                      <TableCell className="text-right">{getStatusBadge(log.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-blue-600" />
                <span>Monthly Calendar</span>
              </CardTitle>
              <CardDescription>Select date to view shift details.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <Calendar selected={selectedDate} onSelect={setSelectedDate} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
