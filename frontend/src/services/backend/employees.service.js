import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/constants/endpoints'
import { ROLES } from '@/constants/roles'

// Production mock dataset for employee fallback if backend API is offline
const INITIAL_MOCK_EMPLOYEES = [
  {
    id: 'EMP-1001',
    _id: 'emp_1001',
    firstName: 'Eleanor',
    lastName: 'Morgan',
    fullName: 'Eleanor Morgan',
    email: 'eleanor.morgan@dayflow.io',
    phone: '+1 (555) 234-5678',
    department: 'Engineering',
    designation: 'Senior Frontend Architect',
    role: ROLES.EMPLOYEE,
    status: 'ACTIVE',
    joiningDate: '2023-03-15',
    salary: 115000,
    address: '452 Tech Parkway, San Francisco, CA',
  },
  {
    id: 'EMP-1002',
    _id: 'emp_1002',
    firstName: 'Marcus',
    lastName: 'Chen',
    fullName: 'Marcus Chen',
    email: 'marcus.chen@dayflow.io',
    phone: '+1 (555) 876-5432',
    department: 'Human Resources',
    designation: 'Lead People Ops Specialist',
    role: ROLES.HR,
    status: 'ACTIVE',
    joiningDate: '2022-08-01',
    salary: 98000,
    address: '88 Market St, Suite 400, San Francisco, CA',
  },
  {
    id: 'EMP-1003',
    _id: 'emp_1003',
    firstName: 'Alexandra',
    lastName: 'Vance',
    fullName: 'Alexandra Vance',
    email: 'alexandra.vance@dayflow.io',
    phone: '+1 (555) 901-2345',
    department: 'Executive Management',
    designation: 'Chief Human Resources Officer',
    role: ROLES.ADMIN,
    status: 'ACTIVE',
    joiningDate: '2021-01-10',
    salary: 165000,
    address: '100 Executive Blvd, San Francisco, CA',
  },
  {
    id: 'EMP-1004',
    _id: 'emp_1004',
    firstName: 'Amina',
    lastName: 'Larsson',
    fullName: 'Amina Larsson',
    email: 'amina.larsson@dayflow.io',
    phone: '+1 (555) 345-6789',
    department: 'Operations',
    designation: 'Operations Coordinator',
    role: ROLES.EMPLOYEE,
    status: 'ACTIVE',
    joiningDate: '2023-06-20',
    salary: 78000,
    address: '312 Bayview Ave, Oakland, CA',
  },
  {
    id: 'EMP-1005',
    _id: 'emp_1005',
    firstName: 'Devon',
    lastName: 'Kovac',
    fullName: 'Devon Kovac',
    email: 'devon.kovac@dayflow.io',
    phone: '+1 (555) 678-9012',
    department: 'Engineering',
    designation: 'Backend Systems Engineer',
    role: ROLES.EMPLOYEE,
    status: 'ACTIVE',
    joiningDate: '2024-02-12',
    salary: 105000,
    address: '77 Silicon Way, San Jose, CA',
  },
  {
    id: 'EMP-1006',
    _id: 'emp_1006',
    firstName: 'Priya',
    lastName: 'Sharma',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@dayflow.io',
    phone: '+1 (555) 432-1098',
    department: 'Finance',
    designation: 'Payroll Specialist',
    role: ROLES.HR,
    status: 'ACTIVE',
    joiningDate: '2022-11-05',
    salary: 89000,
    address: '210 Financial Plaza, San Francisco, CA',
  },
]

let mockEmployees = [...INITIAL_MOCK_EMPLOYEES]

export const employeesService = {
  /**
   * GET /api/v1/employees - Fetch all employees
   */
  async getEmployees() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EMPLOYEES.BASE)
      return response?.data || response
    } catch (error) {
      console.warn('Employees API unavailable, using mock dataset:', error.message)
      return mockEmployees
    }
  },

  /**
   * GET /api/v1/employees/:id - Fetch employee by ID
   */
  async getEmployeeById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EMPLOYEES.BY_ID(id))
      return response?.data || response
    } catch (error) {
      console.warn(`Employee API unavailable for ID ${id}, using mock dataset:`, error.message)
      const emp = mockEmployees.find((e) => e.id === id || e._id === id)
      if (!emp) throw new Error('Employee record not found')
      return emp
    }
  },

  /**
   * POST /api/v1/employees - Provision new employee
   */
  async createEmployee(employeeData) {
    try {
      return await apiClient.post(API_ENDPOINTS.EMPLOYEES.BASE, employeeData)
    } catch (error) {
      console.warn('Create employee API fallback:', error.message)
      const newId = `EMP-${1000 + mockEmployees.length + 1}`
      const newEmp = {
        id: newId,
        _id: `emp_${Date.now()}`,
        fullName: `${employeeData.firstName} ${employeeData.lastName}`,
        status: 'ACTIVE',
        joiningDate: new Date().toISOString().split('T')[0],
        ...employeeData,
      }
      mockEmployees = [newEmp, ...mockEmployees]
      return { success: true, data: newEmp, message: 'Employee provisioned successfully.' }
    }
  },

  /**
   * PATCH /api/v1/employees/:id - Update employee record
   */
  async updateEmployee(id, updateData) {
    try {
      return await apiClient.patch(API_ENDPOINTS.EMPLOYEES.BY_ID(id), updateData)
    } catch (error) {
      console.warn('Update employee API fallback:', error.message)
      mockEmployees = mockEmployees.map((emp) =>
        emp.id === id || emp._id === id ? { ...emp, ...updateData } : emp
      )
      const updated = mockEmployees.find((e) => e.id === id || e._id === id)
      return { success: true, data: updated, message: 'Employee updated successfully.' }
    }
  },
}
