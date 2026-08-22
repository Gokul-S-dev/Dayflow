import React, { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { payrollService } from '@/services/backend/payroll.service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { CreditCard, Search, Edit2, CheckCircle2, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

export function AdminPayrollPage() {
  const [payrolls, setPayrolls] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadPayroll() {
      try {
        const data = await payrollService.getAdminPayroll()
        setPayrolls(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadPayroll()
  }, [])

  const filtered = payrolls.filter((p) =>
    p.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    p.department.toLowerCase().includes(search.toLowerCase())
  )

  const handleEditSalary = (name) => {
    toast.info(`Editing salary structure for ${name}...`)
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
            <CardTitle className="text-2xl font-bold mt-1 text-slate-900">$319,500.00</CardTitle>
            <CardDescription className="text-xs">Gross disbursement across 142 records</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardHeader className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Salary Disbursed</span>
            <CardTitle className="text-2xl font-bold mt-1 text-emerald-700">$274,800.00</CardTitle>
            <CardDescription className="text-xs">After tax & health withholdings</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Statutory Deductions</span>
            <CardTitle className="text-2xl font-bold mt-1 text-blue-700">$44,700.00</CardTitle>
            <CardDescription className="text-xs">Federal tax & benefits held</CardDescription>
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
          <Button variant="default" size="sm">Run Batch Calculation</Button>
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
                      <span>{p.employeeName}</span>
                      <span className="text-[11px] block font-normal text-slate-400">{p.designation}</span>
                    </div>
                  </TableCell>
                  <TableCell>{p.department}</TableCell>
                  <TableCell className="font-mono text-xs">${p.basicSalary.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs text-emerald-600">+${p.allowances.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs text-red-600">-${p.deductions.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs font-bold text-slate-900">${p.netSalary.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleEditSalary(p.employeeName)} title="Edit Salary">
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
