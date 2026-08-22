import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Play, Square, AlertCircle, CalendarDays, Award, Sparkles, CheckCircle } from 'lucide-react'
import { calculateAttendanceHours } from '@/utils/attendanceCalculator'

/**
 * AttendanceControl Component
 * A premium WOW hero attendance card displaying check-in/out and key metrics.
 */
export function AttendanceControl({
  attendanceState,
  onCheckIn,
  onCheckOut,
  isLoading = false,
  error = null,
  leaveBalance = '—',
  nextLeave = 'None',
  attendanceRate = '95.0%'
}) {
  const isCheckedIn = attendanceState?.status === 'CHECKED_IN' || attendanceState?.isCheckedIn
  const isCheckedOut = attendanceState?.status === 'CHECKED_OUT'
  
  const checkInRaw = attendanceState?.checkInTime
  const checkOutRaw = attendanceState?.checkOutTime

  const formatTime = (rawTime) => {
    if (!rawTime) return null
    const d = new Date(rawTime)
    if (isNaN(d.getTime())) return rawTime
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const checkInFormatted = formatTime(checkInRaw)
  const checkOutFormatted = formatTime(checkOutRaw)

  // Calculate working hours dynamically
  const todayDateStr = new Date().toISOString().split('T')[0]
  const calcs = (isCheckedIn || isCheckedOut)
    ? calculateAttendanceHours(checkInFormatted, checkOutFormatted, todayDateStr)
    : { hoursStr: '0.0 hrs', extraStr: '0.0 hrs', hours: 0 }

  return (
    <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-slate-50 via-white to-purple-50/20 p-6 shadow-sm hover:shadow-md transition-all duration-200">
      
      {/* Upper Punch Control Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        
        {/* Left Side: Status Info */}
        <div className="flex items-center gap-4">
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-white shadow-sm transition-transform hover:scale-105 duration-150 ${
              isCheckedIn ? 'bg-emerald-600' : isCheckedOut ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TODAY'S WORKDAY</span>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {isCheckedIn ? 'Checked In' : isCheckedOut ? 'Workday Completed' : 'Not Checked In'}
              </h3>
              <Badge variant={isCheckedIn ? 'success' : isCheckedOut ? 'primary' : 'warning'} dot>
                {isCheckedIn ? 'Active' : isCheckedOut ? 'Finished' : 'Offline'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isCheckedIn
                ? `Punched in at ${checkInFormatted || '--:--'}`
                : isCheckedOut
                ? `Completed shift from ${checkInFormatted || '--:--'} to ${checkOutFormatted || '--:--'}`
                : 'Click the button to record your check-in timestamp'}
            </p>
          </div>
        </div>

        {/* Right Side: Punch Buttons / Error */}
        {error ? (
          <div className="flex items-center gap-2 text-xs text-red-600 font-semibold bg-red-50 p-3 rounded-xl border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 self-start md:self-auto w-full md:w-auto">
            {!isCheckedIn && !isCheckedOut && (
              <Button
                variant="success"
                size="lg"
                disabled={isLoading}
                isLoading={isLoading}
                onClick={onCheckIn}
                leftIcon={<Play className="h-4 w-4 fill-current" />}
                className="w-full md:w-auto shadow-sm px-6 font-bold cursor-pointer transition-colors border-0"
              >
                Check In
              </Button>
            )}
            
            {isCheckedIn && (
              <Button
                variant="destructive"
                size="lg"
                disabled={isLoading}
                isLoading={isLoading}
                onClick={onCheckOut}
                leftIcon={<Square className="h-4 w-4 fill-current" />}
                className="w-full md:w-auto shadow-sm px-6 font-bold cursor-pointer transition-colors border-0"
              >
                Check Out
              </Button>
            )}

            {isCheckedOut && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 w-full md:w-auto justify-center">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Punches Recorded</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lower Metrics Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
        
        {/* Metric 1: Work Hours */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Working Hours</span>
          <p className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isCheckedIn || isCheckedOut ? calcs.hoursStr : '--:--'}
          </p>
          {(isCheckedIn || isCheckedOut) && calcs.extra > 0 && (
            <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60 block w-max">
              {calcs.extraStr} Overtime
            </span>
          )}
        </div>

        {/* Metric 2: Leave Balance */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Leave Balance</span>
          <p className="text-xl font-extrabold text-slate-900 tracking-tight">
            {leaveBalance}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold block">Paid Annual Days</span>
        </div>

        {/* Metric 3: Next Leave */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Next Leave</span>
          <p className="text-xl font-extrabold text-slate-900 tracking-tight truncate max-w-[130px]" title={nextLeave}>
            {nextLeave}
          </p>
          <span className="text-[10px] text-slate-400 font-semibold block">Scheduled Approved</span>
        </div>

        {/* Metric 4: Attendance Rate */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Rate</span>
          <p className="text-xl font-extrabold text-slate-900 tracking-tight">
            {attendanceRate}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <Sparkles className="h-3 w-3 shrink-0" /> Stable Performance
          </span>
        </div>

      </div>

    </div>
  )
}
