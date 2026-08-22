import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { useAuthStore } from '@/store/authStore'
import { dashboardService } from '@/services/backend/dashboard.service'
import { ROUTES } from '@/constants/routes'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Clock, CalendarCheck, CreditCard, BrainCircuit, Plus, ArrowRight, Activity, CheckCircle2 } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadAdminDash() {
      setIsLoading(true)
      try {
        const res = await dashboardService.getAdminDashboard()
        setData(res)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadAdminDash()
  }, [])

  const kpis = data?.kpis || {
    totalEmployees: 142,
    presentToday: 134,
    onLeaveToday: 5,
    absentToday: 3,
    pendingApprovals: 5,
  }

  const attendanceTrend = data?.attendanceTrend || [
    { day: 'Mon', present: 138, absent: 2, leave: 2 },
    { day: 'Tue', present: 136, absent: 3, leave: 3 },
    { day: 'Wed', present: 140, absent: 1, leave: 1 },
    { day: 'Thu', present: 134, absent: 4, leave: 4 },
    { day: 'Fri', present: 132, absent: 5, leave: 5 },
  ]

  const leaveDistribution = data?.leaveDistribution || [
    { name: 'Paid Leave', value: 45, color: '#2563eb' },
    { name: 'Sick Leave', value: 20, color: '#f59e0b' },
    { name: 'Unpaid Leave', value: 10, color: '#ef4444' },
  ]

  const departmentAttendance = data?.departmentAttendance || [
    { department: 'Eng.', rate: 96.5 },
    { department: 'HR', rate: 98.0 },
    { department: 'Ops', rate: 92.1 },
    { department: 'Fin.', rate: 95.4 },
    { department: 'Design', rate: 94.0 },
  ]

  const activities = data?.recentActivities || [
    { id: 'act1', user: 'Eleanor Morgan', action: 'Checked in at 09:02 AM', time: '10 mins ago' },
    { id: 'act2', user: 'Marcus Chen', action: 'Submitted Sick Leave request', time: '25 mins ago' },
    { id: 'act3', user: 'Alexandra Vance', action: 'Approved annual leave for Amina Larsson', time: '1 hour ago' },
  ]

  return (
    <PageContainer
      title={`Good morning, ${user?.name ? user.name.split(' ')[0] : 'HR/Admin'}`}
      description="Here is what's happening across your workforce today."
      badge={<Badge variant="purple" dot>Admin Command Center</Badge>}
      breadcrumbs={[
        { label: 'Admin' },
        { label: 'Dashboard' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.ADMIN.EMPLOYEES)} leftIcon={<Plus className="h-3.5 w-3.5" />}>
            Add Employee
          </Button>
          <Button variant="default" size="sm" onClick={() => navigate(ROUTES.ADMIN.INTELLIGENCE)} leftIcon={<BrainCircuit className="h-3.5 w-3.5" />}>
            Workforce Intelligence
          </Button>
        </div>
      }
    >
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hover:border-blue-300 transition-colors">
          <CardHeader className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Headcount</span>
            <CardTitle className="text-2xl font-bold mt-1 text-slate-900">{kpis.totalEmployees}</CardTitle>
            <CardDescription className="text-xs">Active organization records</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardHeader className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Present Today</span>
            <CardTitle className="text-2xl font-bold mt-1 text-emerald-700">{kpis.presentToday}</CardTitle>
            <CardDescription className="text-xs">94.3% attendance rate</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">On Leave</span>
            <CardTitle className="text-2xl font-bold mt-1 text-blue-700">{kpis.onLeaveToday}</CardTitle>
            <CardDescription className="text-xs">Approved scheduled time-off</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <CardHeader className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Absent</span>
            <CardTitle className="text-2xl font-bold mt-1 text-rose-700">{kpis.absentToday}</CardTitle>
            <CardDescription className="text-xs">Unexcused check-in delays</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</span>
            <CardTitle className="text-2xl font-bold mt-1 text-amber-700">{kpis.pendingApprovals}</CardTitle>
            <CardDescription className="text-xs">Action required by HR</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Attendance Trend Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Weekly Attendance Trend</span>
              <Badge variant="outline">This Week</Badge>
            </CardTitle>
            <CardDescription>Daily present vs absent headcount analysis.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="present" name="Present" fill="#1e40af" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leave" name="Leave" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leave Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leave Share Breakdown</CardTitle>
            <CardDescription>Distribution across leave types.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leaveDistribution} cx="50%" cy="45%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {leaveDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span>Realtime Audit Activity</span>
            </CardTitle>
            <CardDescription>Workforce events and system logs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div>
                  <p className="text-xs font-bold text-slate-800">{act.user}</p>
                  <p className="text-xs text-slate-600">{act.action}</p>
                </div>
                <span className="text-[11px] text-slate-400">{act.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">HR Quick Actions</CardTitle>
            <CardDescription>Direct shortcuts to key admin flows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Button variant="outline" className="w-full justify-start text-xs" onClick={() => navigate(ROUTES.ADMIN.EMPLOYEES)} leftIcon={<Users className="h-4 w-4 text-blue-600" />}>
              Manage Employee Directory
            </Button>
            <Button variant="outline" className="w-full justify-start text-xs" onClick={() => navigate(ROUTES.ADMIN.LEAVE)} leftIcon={<CalendarCheck className="h-4 w-4 text-amber-600" />}>
              Review Leave Approvals (5)
            </Button>
            <Button variant="outline" className="w-full justify-start text-xs" onClick={() => navigate(ROUTES.ADMIN.ATTENDANCE)} leftIcon={<Clock className="h-4 w-4 text-emerald-600" />}>
              View Attendance Logs
            </Button>
            <Button variant="outline" className="w-full justify-start text-xs" onClick={() => navigate(ROUTES.ADMIN.PAYROLL)} leftIcon={<CreditCard className="h-4 w-4 text-purple-600" />}>
              Run February Payroll
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
