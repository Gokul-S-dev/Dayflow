import React from 'react'
import { cn } from '@/lib/utils'

export const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border border-slate-200/90 bg-white text-slate-900 shadow-xs transition-shadow duration-150 hover:shadow-sm',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-5 sm:p-6 border-b border-slate-100', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold text-slate-900 leading-none tracking-tight text-base sm:text-lg', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

export const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs sm:text-sm text-slate-500 font-normal', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 sm:p-6', className)} {...props} />
))
CardContent.displayName = 'CardContent'

export const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-5 sm:p-6 pt-0 border-t border-slate-100 mt-auto', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'
