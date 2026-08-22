import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Menu,
  Bell,
  Search,
  User,
  Shield,
  LogOut,
  ChevronDown,
  Layers,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { ROLES, ROLE_LABELS } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, role, setRole, logout } = useAuthStore()
  const { toggleMobileDrawer } = useUIStore()

  // Format breadcrumb/title from current path
  const getHeaderTitle = (pathname) => {
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length === 0) return 'Overview'
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + ' Portal'
    }
    const section = parts[0].toUpperCase()
    const page = parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
    return `${page}`
  }

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    if (newRole === ROLES.EMPLOYEE) {
      navigate(ROUTES.EMPLOYEE.DASHBOARD)
    } else {
      navigate(ROUTES.ADMIN.DASHBOARD)
    }
  }

  const handleLogout = () => {
    logout()
    navigate(ROUTES.PUBLIC.LOGIN)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
      {/* Left section: Mobile menu toggle + Page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMobileDrawer}
          className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          <h2 className="text-sm sm:text-base font-semibold text-slate-800 tracking-tight">
            {getHeaderTitle(location.pathname)}
          </h2>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:block">
            {location.pathname}
          </span>
        </div>
      </div>

      {/* Right section: Role switcher preview + Notifications + User profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Preview Switcher (For Development & Architecture Testing) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 h-8 border-slate-200 bg-slate-50/70 hover:bg-slate-100"
            >
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              <span className="font-semibold text-slate-700 hidden sm:inline">Role:</span>
              <span className="text-blue-700 font-semibold">{ROLE_LABELS[role] || role}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-48">
            <DropdownMenuLabel>Preview Role As</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleRoleChange(ROLES.EMPLOYEE)}>
              <span className={role === ROLES.EMPLOYEE ? 'font-semibold text-blue-600' : ''}>
                Employee
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange(ROLES.HR)}>
              <span className={role === ROLES.HR ? 'font-semibold text-blue-600' : ''}>
                HR Manager
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange(ROLES.ADMIN)}>
              <span className={role === ROLES.ADMIN ? 'font-semibold text-purple-600' : ''}>
                Administrator
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(ROUTES.DEV.DESIGN_SYSTEM)}>
              <Layers className="h-3.5 w-3.5 text-slate-500" /> Design Tokens Preview
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Icon with Unread Badge */}
        <button
          type="button"
          className="relative p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        {/* User Avatar Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-slate-200 transition-all"
            >
              <Avatar size="sm">
                <AvatarFallback className="bg-slate-100 text-slate-800 text-xs font-semibold">
                  {user?.name
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                    : 'DF'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-56">
            <div className="px-2 py-2 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-800">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || 'user@dayflow.io'}</p>
              <p className="text-[10px] text-blue-600 font-medium mt-0.5">{user?.department || 'Operations'}</p>
            </div>
            <DropdownMenuItem onClick={() => navigate(ROUTES.EMPLOYEE.PROFILE)}>
              <User className="h-3.5 w-3.5" /> My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
