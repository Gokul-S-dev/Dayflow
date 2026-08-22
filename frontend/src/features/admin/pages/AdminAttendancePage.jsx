import React, { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { attendanceService } from '@/services/backend/attendance.service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Clock, Search, Filter, Calendar as CalendarIcon } from 'lucide-react'

export function AdminAttendancePage() {
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')

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

  const filteredLogs = logs.filter((log) => {
    const nameMatch = log.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      log.department.toLowerCase().includes(search.toLowerCase())
    const deptMatch = deptFilter === 'ALL' || log.department === deptFilter
    return nameMatch && deptMatch
  })

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
      title="Company-Wide Attendance Oversight"
      description="Monitor real-time check-ins, shift coverage, and timecard anomalies across departments."
      badge={<Badge variant="success" dot>Realtime Sync</Badge>}
      breadcrumbs={[
        { label: 'Admin' },
        { label: 'Attendance' },
      ]}
    >
      {/* Search & Department Filter */}
      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Filter by employee name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
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
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            <span>Attendance Log Feed</span>
          </CardTitle>
          <CardDescription>Daily punch logs and shift duration summary.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Work Hours</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-semibold text-slate-900">{log.employeeName}</TableCell>
                  <TableCell>{log.department}</TableCell>
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
    </PageContainer>
  )
}
