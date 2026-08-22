import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Play, Square, Loader2, AlertCircle } from 'lucide-react'

/**
 * AttendanceControl Component
 * States: not_checked_in | checking_in | checked_in | checking_out | checked_out | error
 */
export function AttendanceControl({
  attendanceState,
  onCheckIn,
  onCheckOut,
  isLoading = false,
  error = null,
}) {
  const isCheckedIn = attendanceState?.isCheckedIn || attendanceState?.status === 'CHECKED_IN' || attendanceState?.status === 'PRESENT'
  const checkInTime = attendanceState?.checkInTime || attendanceState?.checkIn

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-white shadow-2xs transition-colors ${
              isCheckedIn ? 'bg-emerald-600' : 'bg-slate-700'
            }`}
          >
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Attendance Punch Control</span>
              <Badge variant={isCheckedIn ? 'success' : 'secondary'} dot>
                {isCheckedIn ? 'Checked In' : 'Not Checked In'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isCheckedIn
                ? checkInTime
                  ? `Since ${checkInTime}`
                  : 'Currently checked in for work'
                : 'Click Check In to record your morning punch timestamp'}
            </p>
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-2 text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <Button
            variant={isCheckedIn ? 'destructive' : 'success'}
            size="lg"
            disabled={isLoading}
            isLoading={isLoading}
            onClick={isCheckedIn ? onCheckOut : onCheckIn}
            leftIcon={
              isCheckedIn ? (
                <Square className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )
            }
            className="w-full sm:w-auto shrink-0 shadow-xs font-semibold"
          >
            {isCheckedIn ? 'Check Out →' : 'Check In →'}
          </Button>
        )}
      </div>
    </div>
  )
}
