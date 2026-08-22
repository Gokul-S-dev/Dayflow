import { employeesService } from '@/services/backend/employees.service'

export const odooEmployees = {
  getCurrentEmployee: () => employeesService.getCurrentEmployee(),
  getEmployees: () => employeesService.getEmployees(),
  getEmployeeById: (id) => employeesService.getEmployeeById(id),
  createEmployee: (data) => employeesService.createEmployee(data),
  updateEmployee: (id, data) => employeesService.updateEmployee(id, data),
}
