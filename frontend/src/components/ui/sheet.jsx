import React, { createContext, useContext, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

const SheetContext = createContext({
  open: false,
  setOpen: () => {},
})

export function Sheet({ children, open: controlledOpen, onOpenChange }) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = (val) => {
    if (!isControlled) {
      setUncontrolledOpen(val)
    }
    if (onOpenChange) {
      onOpenChange(val)
    }
  }

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

export function SheetTrigger({ children, asChild, className, ...props }) {
  const { open, setOpen } = useContext(SheetContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props.onClick?.(e)
        setOpen(true)
      },
    })
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}

const sheetVariants = {
  right: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    className: 'inset-y-0 right-0 h-full w-3/4 max-w-sm sm:max-w-md border-l',
  },
  left: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    className: 'inset-y-0 left-0 h-full w-3/4 max-w-sm sm:max-w-md border-r',
  },
  top: {
    initial: { y: '-100%' },
    animate: { y: 0 },
    exit: { y: '-100%' },
    className: 'inset-x-0 top-0 border-b',
  },
  bottom: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    className: 'inset-x-0 bottom-0 border-t',
  },
}

export function SheetContent({
  side = 'right',
  className,
  children,
  showClose = true,
  ...props
}) {
  const { open, setOpen } = useContext(SheetContext)
  const variant = sheetVariants[side] || sheetVariants.right

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [open, setOpen])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={variant.initial}
            animate={variant.animate}
            exit={variant.exit}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className={cn(
              'fixed z-50 flex flex-col bg-white p-6 shadow-2xl border-slate-200 focus:outline-none overflow-y-auto',
              variant.className,
              className
            )}
            {...props}
          >
            {showClose && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 rounded-sm text-slate-400 opacity-70 transition-opacity hover:opacity-100 hover:text-slate-600 focus:outline-none"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function SheetHeader({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col space-y-2 text-left mb-4', className)}
      {...props}
    />
  )
}

export function SheetTitle({ className, ...props }) {
  return (
    <h2
      className={cn('text-lg font-semibold text-slate-900', className)}
      {...props}
    />
  )
}

export function SheetDescription({ className, ...props }) {
  return (
    <p
      className={cn('text-sm text-slate-500', className)}
      {...props}
    />
  )
}

export function SheetFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-auto pt-6 border-t border-slate-100', className)}
      {...props}
    />
  )
}

export function SheetClose({ children, asChild, className, ...props }) {
  const { setOpen } = useContext(SheetContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props.onClick?.(e)
        setOpen(false)
      },
    })
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(false)}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}
