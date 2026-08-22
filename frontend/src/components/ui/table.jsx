import React from 'react'
import { cn } from '@/lib/utils'

export const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-xs">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm text-slate-800 text-left border-collapse', className)}
      {...props}
    />
  </div>
))
Table.displayName = 'Table'

export const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600', className)}
    {...props}
  />
))
TableHeader.displayName = 'TableHeader'

export const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('divide-y divide-slate-100 [&_tr:last-child]:border-0', className)}
    {...props}
  />
))
TableBody.displayName = 'TableBody'

export const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('border-t border-slate-200 bg-slate-50/50 font-medium text-slate-700', className)}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

export const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'transition-colors hover:bg-slate-50/80 data-[state=selected]:bg-blue-50/60',
      className
    )}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

export const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-10 px-4 text-left align-middle font-semibold text-slate-600 text-xs uppercase tracking-wider [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

export const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle text-sm text-slate-700 [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

export const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-xs text-slate-500', className)}
    {...props}
  />
))
TableCaption.displayName = 'TableCaption'
