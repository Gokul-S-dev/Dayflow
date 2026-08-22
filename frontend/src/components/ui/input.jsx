import React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef(({
  className,
  type = 'text',
  error,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}, ref) => {
  return (
    <div className="relative w-full">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
          {leftIcon}
        </div>
      )}
      <input
        type={type}
        disabled={disabled}
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-xs transition-colors',
          'placeholder:text-slate-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-600',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200',
          error && 'border-red-500 focus-visible:ring-red-500/20 focus-visible:border-red-500',
          leftIcon && 'pl-9',
          rightIcon && 'pr-9',
          className
        )}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
          {rightIcon}
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'
