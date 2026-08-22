/**
 * Centralized currency formatter for Indian Rupees (₹).
 */
export const formatCurrency = (value) => {
  if (value === undefined || value === null || isNaN(value)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Calculates salary breakdown based on a monthly wage.
 * Basic: 50% of monthly wage.
 * HRA: 50% of Basic.
 * Standard Allowance: 10% of monthly wage.
 * Performance Bonus: 10% of monthly wage.
 * Leave Travel Allowance (LTA): 5% of monthly wage.
 * Fixed Allowance: Remaining amount to reach exactly the monthly wage.
 * 
 * Deductions:
 * Employee PF: 12% of Basic.
 * Employer PF: 12% of Basic.
 * Professional Tax: ₹200.
 */
export const calculateSalaryComponents = (monthlyWage) => {
  const wage = Number(monthlyWage) || 0;

  // Components
  const basic = Math.round(wage * 0.50);
  const hra = Math.round(basic * 0.50);
  const standardAllowance = Math.round(wage * 0.10);
  const performanceBonus = Math.round(wage * 0.10);
  const lta = Math.round(wage * 0.05);

  // Fixed Allowance is the remainder so total is exactly the monthly wage
  const sumOfComponents = basic + hra + standardAllowance + performanceBonus + lta;
  const fixedAllowance = Math.max(0, wage - sumOfComponents);

  // Provident Fund
  const employeePF = Math.round(basic * 0.12);
  const employerPF = Math.round(basic * 0.12);

  // Professional Tax
  const professionalTax = wage > 15000 ? 200 : 0; // Configurable ₹200

  const totalDeductions = employeePF + professionalTax;
  const netSalary = Math.max(0, wage - totalDeductions);

  return {
    monthlyWage: wage,
    yearlyWage: wage * 12,
    components: {
      basic,
      hra,
      standardAllowance,
      performanceBonus,
      lta,
      fixedAllowance
    },
    pf: {
      employeePF,
      employerPF,
      employeeRate: 12, // 12%
      employerRate: 12  // 12%
    },
    professionalTax,
    totalDeductions,
    netSalary
  };
};

/**
 * Calculates payable days based on working days and leave/attendance inputs.
 * Unpaid leave and missing attendance are deducted.
 */
export const calculatePayableDays = (workingDays, presentDays, paidLeaveDays) => {
  const work = Number(workingDays) || 0;
  const present = Number(presentDays) || 0;
  const paidLeave = Number(paidLeaveDays) || 0;

  // Payable days cannot exceed total working days
  return Math.min(work, present + paidLeave);
};
