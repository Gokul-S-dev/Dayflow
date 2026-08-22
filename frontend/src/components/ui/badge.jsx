import React from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = {
  default: 'bg-slate-100 text-slate-800 border-slate-200',
  primary: 'bg-blue-50 text-blue-700 border-blue-200/80',
  secondary: 'bg-slate-100 text-slate-700 border-slate-200',
  outline: 'bg-transparent text-slate-700 border-slate-300',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
  destructive: 'bg-rose-50 text-rose-700 border-rose-200/80',
  info: 'bg-sky-50 text-sky-700 border-sky-200/80',
  purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
}

const dotColors = {
  default: 'bg-slate-500',
  primary: 'bg-blue-600',
  secondary: 'bg-slate-500',
  outline: 'bg-slate-400',
  success: 'bg-emerald-600',
  warning: 'bg-amber-500',
  destructive: 'bg-rose-500',
  info: 'bg-sky-500',
  purple: 'bg-purple-600',
}

export function Badge({
  className,
  variant = 'default',
  dot = false,
  children,
  ...props
}) {
  const variantClass = badgeVariants[variant] || badgeVariants.default
  const dotColor = dotColors[variant] || dotColors.default

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors select-none tracking-tight',
        variantClass,
        className
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColor)} />}
      <span>{children}</span>
    </div>
  )
}
