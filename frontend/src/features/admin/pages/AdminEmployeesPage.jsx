import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageContainer } from '@/components/layout/PageContainer'
import { employeesService } from '@/services/backend/employees.service'
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
import { Users, Plus, Search, Filter, Eye, Edit2, Mail, Building2, ShieldCheck, ArrowRight } from 'lucide-react'
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
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')
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

  const loadEmployees = async () => {
    try {
      const data = await employeesService.getEmployees()
      setEmployees(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const onSubmit = async (formData) => {
    setSubmitting(true)
    try {
      const res = await employeesService.createEmployee(formData)
      toast.success(res.message || 'Employee provisioned successfully!')
      setDialogOpen(false)
      reset()
      loadEmployees()
    } catch (err) {
      toast.error(err.message || 'Failed to create employee.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredEmployees = employees.filter((emp) => {
    const nameMatch = (emp.fullName || `${emp.firstName} ${emp.lastName}`).toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      (emp.id || '').toLowerCase().includes(search.toLowerCase())
    
    const deptMatch = deptFilter === 'ALL' || emp.department === deptFilter
    return nameMatch && deptMatch
  })

  return (
    <PageContainer
      title="Employee Directory & Management"
      description="Provision new employee accounts, manage departmental roles, and inspect profiles."
      badge={<Badge variant="purple">{filteredEmployees.length} Total Records</Badge>}
      breadcrumbs={[
        { label: 'Admin' },
        { label: 'Employees' },
      ]}
      actions={
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
                Create employee profile and generate login credentials via POST /api/v1/employees.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
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
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    {...register('department')}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Executive Management">Executive Management</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label required>Role Access</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                  <Label required>Annual Base Salary ($)</Label>
                  <Input type="number" placeholder="85000" error={!!errors.salary} {...register('salary')} />
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
      }
    >
      {/* Search & Filter Bar */}
      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by name, email, ID..."
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

      {/* Employee Management Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span>Active Employee Directory</span>
          </CardTitle>
          <CardDescription>Integrates real backend endpoint GET /api/v1/employees.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id || emp._id}>
                  <TableCell className="font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <Avatar size="sm">
                        <AvatarFallback className="bg-slate-100 text-slate-700 font-bold text-xs">
                          {(emp.fullName || emp.firstName || 'E')
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span>{emp.fullName || `${emp.firstName} ${emp.lastName}`}</span>
                        <span className="text-[11px] font-normal text-slate-400">{emp.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-slate-700">{emp.id || 'EMP-1000'}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>
                    <Badge variant={emp.role === ROLES.ADMIN ? 'purple' : emp.role === ROLES.HR ? 'primary' : 'secondary'}>
                      {emp.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{emp.joiningDate || '2023-01-01'}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
