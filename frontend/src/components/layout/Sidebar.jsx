import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Shield,
  UserCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { getNavigationForRole } from '@/constants/navigation'
import { ROLES, ROLE_LABELS } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export function Sidebar() {
  const navigate = useNavigate()
  const { user, role, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  const navItems = getNavigationForRole(role)

  const handleLogout = () => {
    logout()
    navigate(ROUTES.PUBLIC.LOGIN)
  }

  const roleBadgeVariant = role === ROLES.ADMIN ? 'purple' : role === ROLES.HR ? 'primary' : 'secondary'

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col border-r border-slate-200/90 bg-white transition-all duration-200 ease-in-out select-none relative z-30',
        sidebarCollapsed ? 'w-18' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white font-bold shrink-0 shadow-2xs">
              <span className="text-sm font-mono">D</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 tracking-tight">Dayflow</span>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1 py-0.2 rounded border border-blue-200/60">
                  HRMS
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate">Workday, aligned</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white font-bold shadow-2xs">
            <span className="text-sm font-mono">D</span>
          </div>
        )}

        {/* Collapse toggle button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className={cn(
            'p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors',
            sidebarCollapsed && 'mx-auto mt-1'
          )}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Role Indicator Banner */}
      {!sidebarCollapsed && (
        <div className="px-4 py-2.5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            {role === ROLES.ADMIN ? (
              <Shield className="h-3.5 w-3.5 text-purple-600" />
            ) : (
              <UserCheck className="h-3.5 w-3.5 text-blue-600" />
            )}
            <span>Portal Mode</span>
          </div>
          <Badge variant={roleBadgeVariant} className="text-[10px] py-0 px-2">
            {ROLE_LABELS[role] || role}
          </Badge>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {/* Primary Navigation */}
        <div className="space-y-1">
          <div className={cn('text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5', sidebarCollapsed && 'sr-only')}>
            Primary
          </div>
          {navItems.filter(item => item.category === 'primary').map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-md px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/60 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900',
                    sidebarCollapsed && 'justify-center px-2 py-2.5'
                  )
                }
                title={sidebarCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        isActive ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-700'
                      )}
                    />
                    {!sidebarCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!sidebarCollapsed && item.badge && (
                      <span className="rounded-full bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 tracking-wider uppercase">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-1">
          <div className={cn('text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5', sidebarCollapsed && 'sr-only')}>
            Utilities
          </div>
          {navItems.filter(item => item.category === 'secondary').map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-md px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/60 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900',
                    sidebarCollapsed && 'justify-center px-2 py-2.5'
                  )
                }
                title={sidebarCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        isActive ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-700'
                      )}
                    />
                    {!sidebarCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!sidebarCollapsed && item.badge && (
                      <span className="rounded-full bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 tracking-wider uppercase">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/40">
        {!sidebarCollapsed ? (
          <div className="flex items-center justify-between p-1.5 rounded-md hover:bg-slate-100/60 transition-colors">
            <div 
              onClick={() => navigate(ROUTES.EMPLOYEE.PROFILE)}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-85"
            >
              <Avatar size="sm">
                <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
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
              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Avatar 
              size="sm"
              onClick={() => navigate(ROUTES.EMPLOYEE.PROFILE)}
              className="cursor-pointer hover:ring-2 hover:ring-purple-600 transition-all"
            >
              <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                  : 'DF'}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
