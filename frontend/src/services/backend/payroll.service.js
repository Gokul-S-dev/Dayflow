import { apiClient } from '@/services/api/apiClient'

const MOCK_PAYROLL_DATA = [
  {
    id: 'pay_01',
    employeeId: 'EMP-1001',
    employeeName: 'Eleanor Morgan',
    department: 'Engineering',
    designation: 'Senior Frontend Architect',
    basicSalary: 85000,
    allowances: 15000,
    deductions: 5000,
    netSalary: 95000,
    status: 'PROCESSED',
    payPeriod: 'February 2026',
  },
  {
    id: 'pay_02',
    employeeId: 'EMP-1002',
    employeeName: 'Marcus Chen',
    department: 'Human Resources',
    designation: 'Lead People Ops Specialist',
    basicSalary: 72000,
    allowances: 12000,
    deductions: 4500,
    netSalary: 79500,
    status: 'PROCESSED',
    payPeriod: 'February 2026',
  },
  {
    id: 'pay_03',
    employeeId: 'EMP-1003',
    employeeName: 'Alexandra Vance',
    department: 'Executive Management',
    designation: 'Chief Human Resources Officer',
    basicSalary: 130000,
    allowances: 25000,
    deductions: 10000,
    netSalary: 145000,
    status: 'PROCESSED',
    payPeriod: 'February 2026',
  },
]

export const payrollService = {
  /**
   * Get employee personal payroll summary & payslip history
   */
  async getEmployeePayroll() {
    try {
      const response = await apiClient.get('/payroll/personal')
      return response?.data || response
    } catch {
      return {
        currentSalary: {
          baseSalary: 95000,
          housingAllowance: 12000,
          transportAllowance: 4000,
          taxDeductions: 8500,
          healthInsurance: 1500,
          netPayMonthly: 8416.67,
        },
        payslips: [
          { id: 'ps_2026_01', month: 'January 2026', gross: 9250.0, net: 7583.33, status: 'DISBURSED', date: '2026-01-31' },
          { id: 'ps_2025_12', month: 'December 2025', gross: 9250.0, net: 7583.33, status: 'DISBURSED', date: '2025-12-31' },
          { id: 'ps_2025_11', month: 'November 2025', gross: 9250.0, net: 7583.33, status: 'DISBURSED', date: '2025-11-30' },
        ],
      }
    }
  },

  /**
   * Get admin company-wide payroll table
   */
  async getAdminPayroll() {
    try {
      const response = await apiClient.get('/payroll/admin')
      return response?.data || response
    } catch {
      return MOCK_PAYROLL_DATA
    }
  },
}
