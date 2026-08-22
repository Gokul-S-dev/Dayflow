import React, { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { payrollService } from '@/services/backend/payroll.service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Download, FileText, CheckCircle2, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

export function EmployeePayrollPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    async function loadPayroll() {
      try {
        const res = await payrollService.getEmployeePayroll()
        setData(res)
      } catch (err) {
        console.error(err)
      }
    }
    loadPayroll()
  }, [])

  const current = data?.currentSalary || {
    baseSalary: 95000,
    housingAllowance: 12000,
    transportAllowance: 4000,
    taxDeductions: 8500,
    healthInsurance: 1500,
    netPayMonthly: 8416.67,
  }

  const payslips = data?.payslips || [
    { id: 'ps_2026_01', month: 'January 2026', gross: 9250.0, net: 7583.33, status: 'DISBURSED', date: '2026-01-31' },
    { id: 'ps_2025_12', month: 'December 2025', gross: 9250.0, net: 7583.33, status: 'DISBURSED', date: '2025-12-31' },
    { id: 'ps_2025_11', month: 'November 2025', gross: 9250.0, net: 7583.33, status: 'DISBURSED', date: '2025-11-30' },
  ]

  const handleDownload = (month) => {
    toast.success(`Downloading payslip statement for ${month}...`)
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
              <span className="text-xs uppercase font-semibold tracking-wider text-blue-200">Estimated Net Monthly Salary</span>
              <h2 className="text-3xl font-extrabold mt-1">${current.netPayMonthly.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
              <p className="text-xs text-blue-200 mt-1">Direct deposit to Chase Bank ****4892</p>
            </div>
            <Badge variant="outline" className="text-white border-white/40 bg-white/10 text-xs py-1 px-3 self-start sm:self-auto">
              Grade E-4 Senior
            </Badge>
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
                  <span className="text-slate-700">Base Salary</span>
                  <span className="font-semibold text-slate-900">${(current.baseSalary / 12).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-700">Housing Allowance</span>
                  <span className="font-semibold text-slate-900">${(current.housingAllowance / 12).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-700">Transport Allowance</span>
                  <span className="font-semibold text-slate-900">${(current.transportAllowance / 12).toFixed(2)}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Statutory Deductions</span>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-700">Federal Tax Withholding</span>
                  <span className="font-semibold text-red-600">-${(current.taxDeductions / 12).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                  <span className="text-slate-700">Health Insurance Contribution</span>
                  <span className="font-semibold text-red-600">-${(current.healthInsurance / 12).toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center font-bold text-sm text-slate-900 pt-1">
                <span>Total Take-Home Pay</span>
                <span className="text-base text-blue-700">${current.netPayMonthly.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
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
                    <p className="text-[11px] text-slate-400">Net: ${ps.net.toLocaleString()}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(ps.month)} leftIcon={<Download className="h-3.5 w-3.5" />}>
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
