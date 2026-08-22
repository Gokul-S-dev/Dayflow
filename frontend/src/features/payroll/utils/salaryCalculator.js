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

export const salaryConfig = {
  components: {
    basic: {
      base: 'wage',
      type: 'percentage',
      value: 50
    },
    hra: {
      base: 'basic',
      type: 'percentage',
      value: 50
    },
    standardAllowance: {
      base: 'wage',
      type: 'percentage',
      value: 10
    },
    performanceBonus: {
      base: 'wage',
      type: 'percentage',
      value: 10
    },
    lta: {
      base: 'wage',
      type: 'percentage',
      value: 5
    }
  },
  pf: {
    employeePF: {
      base: 'basic',
      type: 'percentage',
      value: 12
    },
    employerPF: {
      base: 'basic',
      type: 'percentage',
      value: 12
    }
  },
  professionalTax: {
    type: 'fixed',
    value: 200,
    minWageThreshold: 15000
  }
};

/**
 * Calculates salary breakdown based on a monthly wage.
 * Components recalculate when Monthly Wage changes.
 * Total salary components never exceed defined wage.
 */
export const calculateSalaryComponents = (monthlyWage) => {
  const wage = Number(monthlyWage) || 0;

  // 1. Calculate basic first since other components might depend on it
  const basicConfig = salaryConfig.components.basic;
  let basic = 0;
  if (basicConfig.type === 'percentage') {
    basic = Math.round(wage * (basicConfig.value / 100));
  } else {
    basic = Number(basicConfig.value) || 0;
  }

  // 2. Calculate remaining components
  const calculatedComponents = { basic };
  let sumOfComponents = basic;

  for (const [key, conf] of Object.entries(salaryConfig.components)) {
    if (key === 'basic') continue;
    let val = 0;
    const baseVal = conf.base === 'basic' ? basic : wage;
    if (conf.type === 'percentage') {
      val = Math.round(baseVal * (conf.value / 100));
    } else {
      val = Number(conf.value) || 0;
    }
    calculatedComponents[key] = val;
    sumOfComponents += val;
  }

  // Ensure total components do not exceed defined wage
  if (sumOfComponents > wage) {
    const scaleFactor = wage / sumOfComponents;
    for (const key of Object.keys(calculatedComponents)) {
      calculatedComponents[key] = Math.round(calculatedComponents[key] * scaleFactor);
    }
    sumOfComponents = Object.values(calculatedComponents).reduce((a, b) => a + b, 0);
  }

  // Fixed Allowance is the remainder so total is exactly the monthly wage
  const fixedAllowance = Math.max(0, wage - sumOfComponents);
  calculatedComponents.fixedAllowance = fixedAllowance;

  // 3. PF calculations based on Basic Salary
  const employeePFConf = salaryConfig.pf.employeePF;
  const employerPFConf = salaryConfig.pf.employerPF;
  
  let employeePF = 0;
  if (employeePFConf.type === 'percentage') {
    const baseVal = employeePFConf.base === 'basic' ? calculatedComponents.basic : wage;
    employeePF = Math.round(baseVal * (employeePFConf.value / 100));
  } else {
    employeePF = Number(employeePFConf.value) || 0;
  }

  let employerPF = 0;
  if (employerPFConf.type === 'percentage') {
    const baseVal = employerPFConf.base === 'basic' ? calculatedComponents.basic : wage;
    employerPF = Math.round(baseVal * (employerPFConf.value / 100));
  } else {
    employerPF = Number(employerPFConf.value) || 0;
  }

  // 4. Professional Tax
  let professionalTax = 0;
  const ptConf = salaryConfig.professionalTax;
  if (ptConf.type === 'fixed') {
    if (wage >= (ptConf.minWageThreshold || 0)) {
      professionalTax = ptConf.value;
    }
  } else {
    professionalTax = Number(ptConf.value) || 0;
  }

  const totalDeductions = employeePF + professionalTax;
  const netSalary = Math.max(0, wage - totalDeductions);

  return {
    monthlyWage: wage,
    yearlyWage: wage * 12,
    components: calculatedComponents,
    pf: {
      employeePF,
      employerPF,
      employeeRate: employeePFConf.value,
      employerRate: employerPFConf.value
    },
    professionalTax,
    totalDeductions,
    netSalary
  };
};

/**
 * Calculates payable days details based on working days and leave/attendance inputs.
 * Unpaid leave and missing attendance are deducted.
 */
export const calculatePayableDays = (workingDays, presentDays, paidLeaveDays, unpaidLeaveDays = 0) => {
  const work = Number(workingDays) || 0;
  const present = Number(presentDays) || 0;
  const paidLeave = Number(paidLeaveDays) || 0;
  const unpaidLeave = Number(unpaidLeaveDays) || 0;

  const missingDays = Math.max(0, work - (present + paidLeave + unpaidLeave));
  const payableDays = Math.min(work, present + paidLeave);

  return {
    workingDays: work,
    presentDays: present,
    paidLeaveDays: paidLeave,
    unpaidLeaveDays: unpaidLeave,
    missingDays,
    payableDays
  };
};

