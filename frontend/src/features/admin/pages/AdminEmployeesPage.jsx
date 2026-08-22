import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageContainer } from '@/components/layout/PageContainer'
import { employeesService } from '@/services/backend/employees.service'
import { dashboardService } from '@/services/backend/dashboard.service'
import { profileMetadataService } from '@/services/backend/profileMetadata'
import { ROLES } from '@/constants/roles'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Users, Plus, Search, Filter, Eye, Mail, Building2, Grid, List } from 'lucide-react'
import { toast } from 'sonner'

const employeeSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid work email required'),
  department: z.string().min(2, 'Department is required'),
  designation: z.string().min(2, 'Designation is required'),
  role: z.enum([ROLES.EMPLOYEE, ROLES.HR, ROLES.ADMIN]),
  salary: z.coerce.number().min(1, 'Salary is required'),
})

export function AdminEmployeesPage() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [adminDash, setAdminDash] = useState(null)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState('GRID') // GRID or LIST
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      role: ROLES.EMPLOYEE,
      department: 'Engineering',
    },
  })

  const loadData = async () => {
    try {
      const [empData, dashData] = await Promise.all([
        employeesService.getEmployees(),
        dashboardService.getAdminDashboard().catch(() => null)
      ])
      setEmployees(empData)
      if (dashData) {
        setAdminDash(dashData)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const onSubmit = async (formData) => {
    setSubmitting(true)
    try {
      const res = await employeesService.createEmployee(formData)
      
      // Seed initial metadata with the salary/wage from the form
      const provisionedEmp = res.data?.employee || res.employee
      if (provisionedEmp) {
        const empId = provisionedEmp.employeeId || provisionedEmp.id
        profileMetadataService.saveMetadata(empId, {
          monthlyWage: Number(formData.salary) || 75000,
          skills: [],
          certifications: [],
          aboutMe: '',
          loveAboutJob: '',
          hobbies: ''
        })
      }

      toast.success(res.message || 'Employee provisioned successfully!')
      setDialogOpen(false)
      reset()
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to create employee.')
    } finally {
      setSubmitting(false)
    }
  }

  const getEmployeeStatus = (emp) => {
    if (!adminDash) return 'ABSENT'
    
    // Check if checked in today
    const hasAtt = adminDash.recentAttendance?.some(
      att => att.employeeId === emp.employeeId || att.userId?._id === emp._id || att.userId === emp._id
    )
    if (hasAtt) return 'PRESENT'

    // Check if on approved leave
    const onLeave = adminDash.pendingLeaves?.some(
      lv => (lv.employeeId === emp.employeeId || lv.userId?._id === emp._id || lv.userId === emp._id) && lv.status === 'APPROVED'
    )
    if (onLeave) return 'LEAVE'

    return 'ABSENT'
  }

  const filteredEmployees = employees.filter((emp) => {
    const nameMatch = (emp.fullName || `${emp.firstName} ${emp.lastName}`).toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      (emp.id || emp.employeeId || '').toLowerCase().includes(search.toLowerCase())
    
    const deptMatch = deptFilter === 'ALL' || emp.department === deptFilter
    return nameMatch && deptMatch
  })

  return (
    <PageContainer
      title="Employee Cards"
      description="Monitor active employee details, account approvals, and department positions."
      badge={<Badge variant="purple">{filteredEmployees.length} Total Records</Badge>}
      breadcrumbs={[
        { label: 'Admin' },
        { label: 'Employee cards' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          {/* View Toggler */}
          <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <Button
              variant={viewMode === 'GRID' ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('GRID')}
              title="Grid View"
              className="h-7 w-7 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'LIST' ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('LIST')}
              title="List View"
              className="h-7 w-7 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Provision New Employee</DialogTitle>
                <DialogDescription>
                  Create employee profile and generate credentials dynamically.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label required>First Name</Label>
                    <Input placeholder="John" error={!!errors.firstName} {...register('firstName')} />
                    {errors.firstName && <p className="text-[11px] text-red-500">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label required>Last Name</Label>
                    <Input placeholder="Doe" error={!!errors.lastName} {...register('lastName')} />
                    {errors.lastName && <p className="text-[11px] text-red-500">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label required>Corporate Email</Label>
                  <Input placeholder="john.doe@dayflow.io" leftIcon={<Mail className="h-4 w-4" />} error={!!errors.email} {...register('email')} />
                  {errors.email && <p className="text-[11px] text-red-500">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label required>Department</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      {...register('department')}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Operations">Operations</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label required>Role Access</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      {...register('role')}
                    >
                      <option value={ROLES.EMPLOYEE}>Employee</option>
                      <option value={ROLES.HR}>HR Manager</option>
                      <option value={ROLES.ADMIN}>Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label required>Designation Title</Label>
                    <Input placeholder="Software Engineer" error={!!errors.designation} {...register('designation')} />
                    {errors.designation && <p className="text-[11px] text-red-500">{errors.designation.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label required>Monthly Salary (INR ₹)</Label>
                    <Input type="number" placeholder="75000" error={!!errors.salary} {...register('salary')} />
                    {errors.salary && <p className="text-[11px] text-red-500">{errors.salary.message}</p>}
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" size="sm" isLoading={submitting}>
                    Provision Employee
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      {/* Search & Filter Bar */}
      <Card className="mb-6 bg-white border-slate-200 shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by name, email, ID..."
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
        </CardContent>
      </Card>

      {/* Main Grid View */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredEmployees.map((emp) => {
            const status = getEmployeeStatus(emp)
            return (
              <Card
                key={emp.id || emp._id}
                className="hover:shadow-md transition-all cursor-pointer bg-white border-slate-200 shadow-xs flex flex-col justify-between"
                onClick={() => navigate(`/admin/employees/${emp.id || emp._id}`)}
              >
                <CardContent className="p-5 flex flex-col items-center text-center space-y-4">
                  {/* Status Ring / Indicator */}
                  <div className="relative">
                    <Avatar size="lg">
                      <AvatarFallback className="bg-purple-100 text-purple-700 font-bold text-base">
                        {(emp.fullName || `${emp.firstName} ${emp.lastName}`).split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      status === 'PRESENT' ? 'bg-emerald-500' : status === 'LEAVE' ? 'bg-blue-500' : 'bg-yellow-400'
                    }`} title={status === 'PRESENT' ? 'Present Today' : status === 'LEAVE' ? 'On Leave' : 'Absent'} />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm leading-none">{emp.fullName || `${emp.firstName} ${emp.lastName}`}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">{emp.designation || 'Staff Member'}</p>
                    <Badge variant="purple" className="text-[10px] py-0.5">{emp.department || 'Engineering'}</Badge>
                  </div>

                  <div className="flex flex-col gap-1 w-full pt-3 border-t border-slate-100 text-[10px] text-slate-500">
                    <div className="flex justify-between">
                      <span>ID:</span>
                      <span className="font-mono font-bold text-slate-700">{emp.employeeId || emp.id || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status Indicator:</span>
                      <span className={`font-bold ${
                        status === 'PRESENT' ? 'text-emerald-600' : status === 'LEAVE' ? 'text-blue-600' : 'text-yellow-600'
                      }`}>
                        {status === 'PRESENT' ? 'Present' : status === 'LEAVE' ? 'On Leave' : 'Absent'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Alternative Table List View */
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Indicator</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => {
                  const status = getEmployeeStatus(emp)
                  return (
                    <TableRow key={emp.id || emp._id} className="border-b border-slate-100">
                      <TableCell className="font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <Avatar size="sm">
                            <AvatarFallback className="bg-purple-100 text-purple-700 font-bold text-xs">
                              {(emp.fullName || emp.firstName || 'E').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span>{emp.fullName || `${emp.firstName} ${emp.lastName}`}</span>
                            <span className="text-[11px] font-normal text-slate-400">{emp.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-slate-700">{emp.employeeId || emp.id || '—'}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>
                        <Badge variant={emp.role === ROLES.ADMIN ? 'purple' : emp.role === ROLES.HR ? 'primary' : 'secondary'}>
                          {emp.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status === 'PRESENT' ? 'success' : status === 'LEAVE' ? 'info' : 'warning'} dot>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => navigate(`/admin/employees/${emp.id || emp._id}`)}
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}
