import React, { useState } from 'react'
import { cn } from '@/lib/utils'

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  default: 'h-9 w-9 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg font-semibold',
}

export const Avatar = React.forwardRef(({
  className,
  size = 'default',
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 font-medium text-slate-700 select-none shadow-2xs',
      sizeClasses[size] || sizeClasses.default,
      className
    )}
    {...props}
  />
))
Avatar.displayName = 'Avatar'

export const AvatarImage = React.forwardRef(({
  className,
  src,
  alt = 'Avatar',
  ...props
}, ref) => {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) return null

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  )
})
AvatarImage.displayName = 'AvatarImage'

export const AvatarFallback = React.forwardRef(({
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center bg-slate-100 font-semibold text-slate-700 uppercase tracking-tight',
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = 'AvatarFallback'
