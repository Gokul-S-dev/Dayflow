import React, { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { useAuthStore } from '@/store/authStore'
import { profileMetadata } from '@/services/backend/profileMetadata'
import { attendanceService } from '@/services/backend/attendance.service'
import { leaveService } from '@/services/backend/leave.service'
import { calculateSalaryComponents, calculatePayableDays } from '@/features/payroll/utils/salaryCalculator'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Download, FileText, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export function EmployeePayrollPage() {
  const { user } = useAuthStore()
  const [attendanceLogs, setAttendanceLogs] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [attLogs, lvRequests] = await Promise.all([
          attendanceService.getAttendanceLogs(),
          leaveService.getLeaveRequests('ALL')
        ])
        setAttendanceLogs(attLogs || [])
        setLeaveRequests(lvRequests || [])
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Retrieve user metadata details
  const metadata = profileMetadata.getMetadata(user?.employeeId)
  const monthlyWage = metadata?.monthlyWage || 75000

  // Calculate working days in current month (excluding weekends)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthName = new Date().toLocaleString('default', { month: 'long' })

  let totalWorkingDays = 0
  const tempDate = new Date(currentYear, currentMonth, 1)
  while (tempDate.getMonth() === currentMonth) {
    const day = tempDate.getDay()
    if (day !== 0 && day !== 6) totalWorkingDays++
    tempDate.setDate(tempDate.getDate() + 1)
  }

  // Count present days in current month from check logs
  const presentDays = attendanceLogs.filter(log => {
    if (!log.date) return false
    const d = new Date(log.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && (log.status === 'CHECKED_OUT' || log.status === 'CHECKED_IN')
  }).length

  // Count paid leaves (APPROVED) and unpaid leaves in current month
  let paidLeaveDays = 0
  let unpaidLeaveDays = 0

  leaveRequests.forEach(req => {
    if (req.status !== 'APPROVED') return
    const start = new Date(req.startDate)
    const end = new Date(req.endDate)
    
    const d = new Date(start)
    while (d <= end) {
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const day = d.getDay()
        if (day !== 0 && day !== 6) {
          if (req.type === 'Paid Leave' || req.type === 'Sick Leave') {
            paidLeaveDays++
          } else {
            unpaidLeaveDays++
          }
        }
      }
      d.setDate(d.getDate() + 1)
    }
  })

  // Calculate payable days
  const payDetails = calculatePayableDays(totalWorkingDays, presentDays, paidLeaveDays, unpaidLeaveDays)

  // Recalculate components based on payable ratio
  const fullSalary = calculateSalaryComponents(monthlyWage)
  const payFactor = payDetails.workingDays > 0 ? (payDetails.payableDays / payDetails.workingDays) : 1

  const monthlyGross = Math.round(fullSalary.monthlyWage * payFactor)
  
  // Calculate proportional earnings components
  const basic = Math.round(fullSalary.components.basic * payFactor)
  const hra = Math.round(fullSalary.components.hra * payFactor)
  const standardAllowance = Math.round(fullSalary.components.standardAllowance * payFactor)
  const performanceBonus = Math.round(fullSalary.components.performanceBonus * payFactor)
  const lta = Math.round(fullSalary.components.lta * payFactor)
  const fixedAllowance = Math.max(0, monthlyGross - (basic + hra + standardAllowance + performanceBonus + lta))

  // Indian tax deductions
  const employeePF = Math.round(basic * 0.12)
  const professionalTax = monthlyGross >= 15000 ? 200 : 0
  const totalDeductions = employeePF + professionalTax
  const netTakeHome = Math.max(0, monthlyGross - totalDeductions)

  // Generate payslip history
  const payslips = [
    { id: 'ps_2026_01', month: 'January 2026', gross: monthlyGross, net: netTakeHome, status: 'DISBURSED' },
    { id: 'ps_2025_12', month: 'December 2025', gross: monthlyWage, net: calculateSalaryComponents(monthlyWage).netSalary, status: 'DISBURSED' },
  ]

  const handleDownload = (monthName) => {
    toast.success(`Downloading payslip statement for ${monthName}...`)
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
      <PageContainer title="Salary & Payslip Statements" description="Syncing payroll datasets...">
        <div className="h-64 flex items-center justify-center text-slate-400">Loading payroll ledger...</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Salary & Payslip Statements"
      description="View current compensation structure, tax withholdings, and monthly payslips."
      badge={<Badge variant="success" dot>Disbursed</Badge>}
      breadcrumbs={[
        { label: 'Employee' },
        { label: 'Payroll' },
      ]}
    >
      {/* Top Net Monthly Card */}
      <Card className="mb-6 bg-gradient-to-r from-blue-700 to-blue-900 text-white border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-semibold tracking-wider text-blue-200">Take-Home Pay ({monthName} {currentYear})</span>
              <h2 className="text-3xl font-extrabold mt-1">{formatCurrency(netTakeHome)}</h2>
              <p className="text-xs text-blue-200 mt-1">
                Direct deposit to {metadata?.bankName || 'Axis Bank'} (A/C ****{(metadata?.bankAccountNumber || '1234').slice(-4)})
              </p>
            </div>
            <div className="flex flex-col gap-1 items-start sm:items-end">
              <Badge variant="outline" className="text-white border-white/40 bg-white/10 text-xs py-1 px-3 self-start sm:self-auto">
                Payable Days: {payDetails.payableDays} / {payDetails.workingDays}
              </Badge>
              {payDetails.missingDays > 0 && (
                <span className="text-[10px] text-amber-200 font-semibold mt-1">
                  ({payDetails.missingDays} unpaid days deducted)
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings & Deductions Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span>Compensation Breakdown</span>
              </CardTitle>
              <CardDescription>Itemized monthly earnings and statutory deductions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Earnings */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Earnings</span>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-700">Basic Salary</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(basic)}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-700">House Rent Allowance (HRA)</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(hra)}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-700">Standard Allowance</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(standardAllowance)}</span>
                </div>
                {performanceBonus > 0 && (
                  <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                    <span className="text-slate-700">Performance Bonus</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(performanceBonus)}</span>
                  </div>
                )}
                {lta > 0 && (
                  <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                    <span className="text-slate-700">Leave Travel Allowance (LTA)</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(lta)}</span>
                  </div>
                )}
                {fixedAllowance > 0 && (
                  <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                    <span className="text-slate-700">Fixed Special Allowance</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(fixedAllowance)}</span>
                  </div>
                )}
              </div>

              {/* Deductions */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Statutory Deductions</span>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-700">Employee Provident Fund (EPF 12%)</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(employeePF)}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-700">Professional Tax (PT)</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(professionalTax)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center font-bold text-sm text-slate-900 pt-1">
                <span>Total Net Take-Home</span>
                <span className="text-base text-blue-700">{formatCurrency(netTakeHome)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payslips Download */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Monthly Payslips</span>
              </CardTitle>
              <CardDescription>Download official PDF statements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {payslips.map((ps) => (
                <div key={ps.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{ps.month}</p>
                    <p className="text-[11px] text-slate-400">Net: {formatCurrency(ps.net)}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(ps.month)} className="border-slate-200">
                    PDF
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
