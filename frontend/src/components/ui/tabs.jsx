import React, { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

const TabsContext = createContext({
  value: '',
  onValueChange: () => {},
})

export function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '')
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue

  const handleValueChange = (newValue) => {
    if (!isControlled) {
      setUncontrolledValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn('flex flex-col gap-3', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 border border-slate-200/60 select-none',
        className
      )}
      {...props}
    />
  )
}

export function TabsTrigger({
  value,
  className,
  children,
  disabled = false,
  ...props
}) {
  const context = useContext(TabsContext)
  const isSelected = context.value === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => context.onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs sm:text-sm font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:pointer-events-none disabled:opacity-50',
        isSelected
          ? 'bg-white text-slate-900 shadow-xs font-semibold'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children, ...props }) {
  const context = useContext(TabsContext)
  if (context.value !== value) return null

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={cn('outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20', className)}
      {...props}
    >
      {children}
    </div>
  )
}
