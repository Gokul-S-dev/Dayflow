import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { EmployeeStatusIndicator } from './EmployeeStatusIndicator'
import { Building2, Mail, User } from 'lucide-react'

export function EmployeeCard({ employee, attendanceStatus, onClick }) {
  if (!employee) return null

  const name = employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.name || 'Employee'
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'EP'

  const status = attendanceStatus || employee.attendanceStatus || employee.status || 'ABSENT'

  return (
    <Card
      onClick={onClick}
      className={`relative border border-slate-200 bg-white shadow-xs transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-sm' : ''
      }`}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              {employee.avatar ? <AvatarImage src={employee.avatar} alt={name} /> : null}
              <AvatarFallback className="bg-slate-100 text-slate-700 font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">{name}</h4>
              <p className="text-xs font-semibold text-blue-700">{employee.designation || 'Staff Member'}</p>
              <p className="text-[11px] text-slate-400 font-mono">{employee.id || employee.employeeId || 'ID Not Set'}</p>
            </div>
          </div>

          <div className="shrink-0">
            <EmployeeStatusIndicator status={status} />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{employee.department || 'General'}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate justify-end">
            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{employee.email || 'No Email'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
