import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = {
  variant: {
    default: 'bg-[#1e40af] text-white hover:bg-[#1d4ed8] active:bg-[#1e3a8a] shadow-xs focus-visible:ring-blue-500/30',
    primary: 'bg-[#1e40af] text-white hover:bg-[#1d4ed8] active:bg-[#1e3a8a] shadow-xs focus-visible:ring-blue-500/30',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200/80 active:bg-slate-200 focus-visible:ring-slate-400/30',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 shadow-xs focus-visible:ring-slate-400/30',
    ghost: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200/70',
    destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-xs focus-visible:ring-red-500/30',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-xs focus-visible:ring-emerald-500/30',
    link: 'text-blue-600 underline-offset-4 hover:underline p-0 h-auto font-normal',
  },
  size: {
    default: 'h-9 px-4 py-2 text-sm',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-10 rounded-md px-5 text-sm font-medium',
    icon: 'h-9 w-9 p-0',
    'icon-sm': 'h-8 w-8 p-0',
  }
}

export const Button = React.forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  isLoading = false,
  disabled,
  children,
  leftIcon,
  rightIcon,
  type = 'button',
  ...props
}, ref) => {
  const variantClass = buttonVariants.variant[variant] || buttonVariants.variant.default
  const sizeClass = buttonVariants.size[size] || buttonVariants.size.default

  return (
    <button
      type={type}
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClass,
        sizeClass,
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
      {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
})

Button.displayName = 'Button'
