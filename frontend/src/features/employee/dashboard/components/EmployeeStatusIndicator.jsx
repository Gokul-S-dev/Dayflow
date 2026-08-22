import React from 'react'
import { Badge } from '@/components/ui/badge'

/**
 * Status meanings per spec:
 * - Green (PRESENT): Present in office
 * - Blue (LEAVE): On leave
 * - Yellow (ABSENT): Absent without time off
 */
export function EmployeeStatusIndicator({ status = 'ABSENT', className }) {
  const normalized = (status || '').toUpperCase()

  if (normalized === 'PRESENT') {
    return <Badge variant="success" dot className={className}>Present</Badge>
  }

  if (normalized === 'LEAVE' || normalized === 'ON_LEAVE') {
    return <Badge variant="info" dot className={className}>On Leave</Badge>
  }

  // ABSENT / DEFAULT -> Yellow/Warning indicator
  return <Badge variant="warning" dot className={className}>Absent</Badge>
}
