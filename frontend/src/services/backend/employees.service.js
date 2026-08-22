import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/constants/endpoints'

export const employeesService = {
  /**
   * GET /api/v1/employees/me or getCurrentEmployee
   */
  async getCurrentEmployee() {
    try {
      const response = await apiClient.get('/employees/me')
      return response?.data || response
    } catch (error) {
      // If /me is not directly available, try fetching by current user ID or return null to trigger empty/error UI state
      if (error.status === 404 || error.status === 401) {
        throw error
      }
      throw error
    }
  },

  /**
   * GET /api/v1/employees - Fetch all employees from backend / Odoo
   */
  async getEmployees() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EMPLOYEES.BASE)
      if (Array.isArray(response)) return response
      if (Array.isArray(response?.data)) return response.data
      return []
    } catch (error) {
      throw error
    }
  },

  /**
   * GET /api/v1/employees/:id - Fetch single employee by ID
   */
  async getEmployeeById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EMPLOYEES.BY_ID(id))
      return response?.data || response
    } catch (error) {
      throw error
    }
  },

  /**
   * POST /api/v1/employees - Provision new employee
   */
  async createEmployee(employeeData) {
    return await apiClient.post(API_ENDPOINTS.EMPLOYEES.BASE, employeeData)
  },

  /**
   * PATCH /api/v1/employees/:id - Update employee details
   */
  async updateEmployee(id, updateData) {
    return await apiClient.patch(API_ENDPOINTS.EMPLOYEES.BY_ID(id), updateData)
  },
}
