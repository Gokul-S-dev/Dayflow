import React, { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { odooEmployees } from '@/services/odoo/employees'
import { profileMetadata } from '@/services/backend/profileMetadata'
import { calculateSalaryComponents } from '@/features/payroll/utils/salaryCalculator'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { CreditCard, Search, Edit2 } from 'lucide-react'
import { toast } from 'sonner'

export function AdminPayrollPage() {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await odooEmployees.getEmployees()
      setEmployees(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Calculate salary details for all loaded employees
  const processedEmployees = employees.map(emp => {
    const meta = profileMetadata.getMetadata(emp.employeeId)
    const sal = calculateSalaryComponents(meta.monthlyWage)
    
    // Calculate total allowances
    const allowances = (sal.components.hra || 0) + 
                       (sal.components.standardAllowance || 0) + 
                       (sal.components.performanceBonus || 0) + 
                       (sal.components.lta || 0) + 
                       (sal.components.fixedAllowance || 0)

    return {
      id: emp.id || emp.employeeId,
      employeeId: emp.employeeId,
      name: emp.name || `${emp.firstName} ${emp.lastName}`,
      designation: emp.designation || 'Staff',
      department: emp.department || 'Operations',
      basicSalary: sal.components.basic,
      allowances,
      deductions: sal.totalDeductions,
      netSalary: sal.netSalary,
      grossSalary: sal.monthlyWage
    }
  })

  const filtered = processedEmployees.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.department.toLowerCase().includes(search.toLowerCase())
  )

  // Totals calculations
  const totalGross = filtered.reduce((sum, p) => sum + p.grossSalary, 0)
  const totalNet = filtered.reduce((sum, p) => sum + p.netSalary, 0)
  const totalDeductions = filtered.reduce((sum, p) => sum + p.deductions, 0)

  const handleEditSalary = (name) => {
    toast.info(`Editing salary structure for ${name}...`)
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val)
  }

  if (isLoading) {
    return (
      <PageContainer title="Company Payroll Management" description="Syncing ledger databases...">
        <div className="h-64 flex items-center justify-center text-slate-400">Loading company payroll...</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Company Payroll Management"
      description="Inspect salary structures, configure allowances, review deductions, and authorize monthly payouts."
      badge={<Badge variant="purple">February 2026 Cycle</Badge>}
      breadcrumbs={[
        { label: 'Admin' },
        { label: 'Payroll' },
      ]}
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-purple-600">
          <CardHeader className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Monthly Payroll</span>
            <CardTitle className="text-2xl font-bold mt-1 text-slate-900">{formatCurrency(totalGross)}</CardTitle>
            <CardDescription className="text-xs">Gross disbursement across {filtered.length} records</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardHeader className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Salary Disbursed</span>
            <CardTitle className="text-2xl font-bold mt-1 text-emerald-700">{formatCurrency(totalNet)}</CardTitle>
            <CardDescription className="text-xs">After EPF & Professional Tax deductions</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Statutory Deductions</span>
            <CardTitle className="text-2xl font-bold mt-1 text-blue-700">{formatCurrency(totalDeductions)}</CardTitle>
            <CardDescription className="text-xs">Provident fund & Professional Tax held</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search employee or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <Button variant="default" size="sm" onClick={() => toast.success('Payroll batch calculation completed successfully.')}>
            Run Batch Calculation
          </Button>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-purple-600" />
            <span>Employee Salary Structures</span>
          </CardTitle>
          <CardDescription>Read-write administration table for payroll profiles.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold text-slate-900">
                    <div>
                      <span>{p.name}</span>
                      <span className="text-[11px] block font-normal text-slate-400">{p.designation} (ID: {p.employeeId})</span>
                    </div>
                  </TableCell>
                  <TableCell>{p.department}</TableCell>
                  <TableCell className="font-mono text-xs">{formatCurrency(p.basicSalary)}</TableCell>
                  <TableCell className="font-mono text-xs text-emerald-600">+{formatCurrency(p.allowances)}</TableCell>
                  <TableCell className="font-mono text-xs text-red-600">-{formatCurrency(p.deductions)}</TableCell>
                  <TableCell className="font-mono text-xs font-bold text-slate-900">{formatCurrency(p.netSalary)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleEditSalary(p.name)} title="Edit Salary">
                      <Edit2 className="h-3.5 w-3.5 text-slate-600" />
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
