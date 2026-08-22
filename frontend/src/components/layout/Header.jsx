import React from 'react'
import { useLocation, useNavigate, NavLink } from 'react-router-dom'
import {
  Menu,
  Bell,
  User,
  Shield,
  LogOut,
  ChevronDown,
  Layers,
  Users,
  Clock,
  CalendarDays,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { ROLES, ROLE_LABELS } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
    navigate(ROUTES.PUBLIC.LOGIN, { replace: true })
  }

  const isEmployeeMode = role === ROLES.EMPLOYEE

  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'DF'

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-2xs">
      {/* Left Section: Logo & Top Nav Links */}
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={toggleMobileDrawer}
          className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div
          onClick={() => navigate(isEmployeeMode ? ROUTES.EMPLOYEE.DASHBOARD : ROUTES.ADMIN.DASHBOARD)}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white font-bold font-mono text-sm shadow-2xs">
            D
          </div>
          <span className="font-bold text-base text-slate-900 tracking-tight hidden sm:inline">
            Dayflow
          </span>
        </div>

        {/* Employee Top Navigation Links (Spec: Employees | Attendance | Time Off) */}
        {isEmployeeMode && (
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200">
            <NavLink
              to={ROUTES.EMPLOYEE.DASHBOARD}
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Users className="h-3.5 w-3.5" />
              <span>Employees</span>
            </NavLink>

            <NavLink
              to={ROUTES.EMPLOYEE.ATTENDANCE}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Attendance</span>
            </NavLink>

            <NavLink
              to={ROUTES.EMPLOYEE.LEAVE}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Time Off</span>
            </NavLink>
          </nav>
        )}
      </div>

      {/* Right Section: Role Preview Switcher + User Avatar Dropdown */}
      <div className="flex items-center gap-3">
        {/* Role Preview Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 h-8 border-slate-200 bg-slate-50/80 hover:bg-slate-100"
            >
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              <span className="font-semibold text-slate-700 hidden sm:inline">Role:</span>
              <span className="text-blue-700 font-bold">{ROLE_LABELS[role] || role}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-48">
            <DropdownMenuLabel>Preview Role As</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleRoleChange(ROLES.EMPLOYEE)}>
              <span className={role === ROLES.EMPLOYEE ? 'font-bold text-blue-600' : ''}>
                Employee
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange(ROLES.HR)}>
              <span className={role === ROLES.HR ? 'font-bold text-blue-600' : ''}>
                HR Manager
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange(ROLES.ADMIN)}>
              <span className={role === ROLES.ADMIN ? 'font-bold text-purple-600' : ''}>
                Administrator
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(ROUTES.DEV.DESIGN_SYSTEM)}>
              <Layers className="h-3.5 w-3.5 text-slate-500" /> Design Tokens Preview
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar Menu Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-blue-500/30 transition-all focus:outline-none"
            >
              <Avatar size="sm">
                {user?.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                <AvatarFallback className="bg-blue-100 text-blue-800 text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-56">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-900">{user?.name || 'Authenticated User'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email || 'user@dayflow.io'}</p>
              <p className="text-[10px] text-blue-600 font-semibold mt-0.5">{user?.department || 'Operations'}</p>
            </div>
            <DropdownMenuItem onClick={() => navigate(ROUTES.EMPLOYEE.PROFILE)}>
              <User className="h-3.5 w-3.5 text-slate-600" /> My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" /> Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
