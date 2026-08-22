import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Shield, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { getNavigationForRole } from '@/constants/navigation'
import { ROLES, ROLE_LABELS } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function MobileNav() {
  const navigate = useNavigate()
  const { user, role, logout } = useAuthStore()
  const { mobileDrawerOpen, setMobileDrawerOpen } = useUIStore()

  const navItems = getNavigationForRole(role)

  const handleNavClick = (path) => {
    setMobileDrawerOpen(false)
    navigate(path)
  }

  const handleLogout = () => {
    setMobileDrawerOpen(false)
    logout()
    navigate(ROUTES.PUBLIC.LOGIN)
  }

  const roleBadgeVariant = role === ROLES.ADMIN ? 'purple' : role === ROLES.HR ? 'primary' : 'secondary'

  return (
    <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
      <SheetContent side="left" className="w-72 p-0 flex flex-col h-full">
        {/* Brand Header */}
        <SheetHeader className="p-4 border-b border-slate-100 mb-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white font-bold shrink-0">
              <span className="text-sm font-mono">D</span>
            </div>
            <div>
              <SheetTitle className="text-sm font-bold text-slate-900">Dayflow HRMS</SheetTitle>
              <p className="text-[10px] text-slate-400">Every workday, perfectly aligned.</p>
            </div>
          </div>
        </SheetHeader>

        {/* Role Banner */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            {role === ROLES.ADMIN ? (
              <Shield className="h-3.5 w-3.5 text-purple-600" />
            ) : (
              <UserCheck className="h-3.5 w-3.5 text-blue-600" />
            )}
            <span>Current Role</span>
          </div>
          <Badge variant={roleBadgeVariant} className="text-[10px] py-0 px-2">
            {ROLE_LABELS[role] || role}
          </Badge>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setMobileDrawerOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/60'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isActive ? 'text-blue-700' : 'text-slate-500'
                      )}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 uppercase">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>

        {/* Footer profile */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-3">
          <div className="flex items-center gap-2.5">
            <Avatar size="sm">
              <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                  : 'DF'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'User'}</span>
              <span className="text-[10px] text-slate-400 truncate">{user?.email || 'user@dayflow.io'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
