import React, { useState } from 'react'
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Calendar({
  selected,
  onSelect,
  className,
  ...props
}) {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date())

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className={cn('p-3 bg-white rounded-lg border border-slate-200 shadow-xs w-full max-w-[280px]', className)} {...props}>
      {/* Month & Nav Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="text-xs font-semibold text-slate-800">
          {format(currentMonth, 'MMMM yyyy')}
        </h4>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {weekDays.map((day) => (
          <span key={day} className="text-[11px] font-medium text-slate-400 py-1">
            {day}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = selected && isSameDay(day, selected)
          const isCurrentMonth = isSameMonth(day, monthStart)
          const isCurrentDay = isToday(day)

          return (
            <button
              key={day.toString()}
              type="button"
              onClick={() => onSelect?.(day)}
              className={cn(
                'h-8 w-8 text-xs rounded-md flex items-center justify-center transition-colors select-none font-normal',
                !isCurrentMonth && 'text-slate-300 pointer-events-none',
                isCurrentMonth && !isSelected && 'text-slate-700 hover:bg-slate-100',
                isCurrentDay && !isSelected && 'border border-blue-600 font-semibold text-blue-600',
                isSelected && 'bg-blue-700 text-white font-semibold hover:bg-blue-800'
              )}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
