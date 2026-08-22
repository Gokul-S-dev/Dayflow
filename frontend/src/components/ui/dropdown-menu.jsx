import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'

const DropdownContext = createContext({
  open: false,
  setOpen: () => {},
})

export function DropdownMenu({ children, open: controlledOpen, onOpenChange }) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = (value) => {
    if (!isControlled) {
      setUncontrolledOpen(value)
    }
    if (onOpenChange) {
      onOpenChange(value)
    }
  }

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownContext.Provider>
  )
}

export function DropdownMenuTrigger({ children, asChild, className, ...props }) {
  const { open, setOpen } = useContext(DropdownContext)

  const handleClick = (e) => {
    e.stopPropagation()
    setOpen(!open)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props.onClick?.(e)
        handleClick(e)
      },
      'aria-expanded': open,
      'aria-haspopup': true,
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-expanded={open}
      aria-haspopup={true}
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({
  children,
  align = 'left',
  sideOffset = 4,
  className,
  ...props
}) {
  const { open, setOpen } = useContext(DropdownContext)
  const contentRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, setOpen])

  const alignClasses = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
    center: 'left-1/2 -translate-x-1/2 origin-top',
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          style={{ marginTop: sideOffset }}
          className={cn(
            'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-900 shadow-md',
            alignClasses[align] || alignClasses.left,
            className
          )}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function DropdownMenuItem({
  className,
  inset,
  children,
  onClick,
  disabled = false,
  destructive = false,
  ...props
}) {
  const { setOpen } = useContext(DropdownContext)

  const handleClick = (e) => {
    if (disabled) return
    onClick?.(e)
    setOpen(false)
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2.5 py-1.5 text-xs sm:text-sm outline-none transition-colors',
        'hover:bg-slate-100 focus:bg-slate-100 disabled:pointer-events-none disabled:opacity-50',
        inset && 'pl-8',
        destructive ? 'text-red-600 hover:bg-red-50 focus:bg-red-50' : 'text-slate-700 hover:text-slate-900',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownMenuLabel({ className, inset, ...props }) {
  return (
    <div
      className={cn(
        'px-2.5 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  )
}

export function DropdownMenuSeparator({ className, ...props }) {
  return <div className={cn('-mx-1 my-1 h-px bg-slate-100', className)} {...props} />
}
