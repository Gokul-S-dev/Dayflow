import React from 'react'
import { cn } from '@/lib/utils'

export const Label = React.forwardRef(({
  className,
  required = false,
  children,
  ...props
}, ref) => (
  <label
    ref={ref}
    className={cn(
      'text-xs font-semibold text-slate-700 tracking-wide select-none inline-flex items-center gap-1',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
  </label>
))

Label.displayName = 'Label'
