import React from 'react'
import { EmployeeCard } from './EmployeeCard'
import { DashboardEmptyState } from './DashboardEmptyState'

export function EmployeeGrid({ employees = [], onSelectEmployee }) {
  if (!employees || employees.length === 0) {
    return <DashboardEmptyState />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {employees.map((emp) => (
        <EmployeeCard
          key={emp.id || emp._id || emp.email}
          employee={emp}
          attendanceStatus={emp.attendanceStatus || emp.status}
          onClick={onSelectEmployee ? () => onSelectEmployee(emp) : undefined}
        />
      ))}
    </div>
  )
}
