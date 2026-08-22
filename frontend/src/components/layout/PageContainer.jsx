import React from 'react'
import { cn } from '@/lib/utils'

export function PageContainer({
  title,
  description,
  badge,
  breadcrumbs = [],
  actions,
  children,
  className,
}) {
  return (
    <div className={cn('p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6', className)}>
      {/* Header section if title or breadcrumbs provided */}
      {(title || breadcrumbs.length > 0 || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div className="space-y-1">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <nav className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.label || idx}>
                    {idx > 0 && <span className="text-slate-300">/</span>}
                    {crumb.href ? (
                      <a href={crumb.href} className="hover:text-slate-700 transition-colors">
                        {crumb.label}
                      </a>
                    ) : (
                      <span className="text-slate-600 font-semibold">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}

            {/* Title & Badge */}
            <div className="flex items-center gap-2.5">
              {title && (
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {title}
                </h1>
              )}
              {badge && <span>{badge}</span>}
            </div>

            {/* Description */}
            {description && (
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                {description}
              </p>
            )}
          </div>

          {/* Action buttons slot */}
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      {/* Main Content Area */}
      <div>{children}</div>
    </div>
  )
}
