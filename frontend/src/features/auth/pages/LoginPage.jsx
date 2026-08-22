import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'
import { authService } from '@/services/backend/auth.service'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Building2 } from 'lucide-react'
import { toast } from 'sonner'

const loginSchema = z.object({
  login: z.string().min(3, 'Enter your email address or Employee ID'),
  password: z.string().min(1, 'Password is required'),
})

/**
 * Maps raw backend error messages to user-friendly equivalents.
 */
function mapAuthError(message = '') {
  const lower = message.toLowerCase()
  if (lower.includes('invalid email') || lower.includes('invalid email/login') || lower.includes('incorrect')) {
    return 'Your Login ID/email or password is incorrect. Please try again.'
  }
  if (lower.includes('verify your email') || lower.includes('not verified')) {
    return 'Please verify your email address before signing in. Check your inbox for the verification link.'
  }
  if (lower.includes('deactivated')) {
    return 'Your account has been deactivated. Please contact your administrator.'
  }
  if (lower.includes('awaiting') || lower.includes('pending approval')) {
    return 'Your account is awaiting HR approval. You will be notified once approved.'
  }
  if (lower.includes('not approved') || lower.includes('rejected')) {
    return 'Your account has not been approved. Please contact HR for assistance.'
  }
  if (lower.includes('network') || lower.includes('failed to fetch') || lower.includes('load failed')) {
    return "We couldn't connect to Dayflow. Please check your internet connection and try again."
  }
  if (lower.includes('session') || lower.includes('expired') || lower.includes('token')) {
    return 'Your session has expired. Please sign in again.'
  }
  return message || 'Sign in failed. Please check your credentials and try again.'
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  const from = location.state?.from?.pathname || null

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: '',
      password: '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setApiError(null)
    try {
      const response = await authService.login(data)
      const userData = response?.data?.user
      const userToken = response?.data?.accessToken
      const requiresPasswordChange = response?.data?.requiresPasswordChange === true

      if (userData && userToken) {
        const mappedUser = {
          id: userData.id,
          name: `${userData.firstName} ${userData.lastName}`.trim(),
          email: userData.email,
          role: userData.role,
          employeeId: userData.employeeId,
        }
        setAuth({
          user: mappedUser,
          token: userToken,
          requiresPasswordChange,
        })

        if (requiresPasswordChange) {
          toast.info('Please set a new password to continue.')
          navigate(ROUTES.PUBLIC.CHANGE_PASSWORD, { replace: true })
          return
        }

        toast.success('Signed in successfully!')
        const roleTarget = userData.role === ROLES.EMPLOYEE
          ? ROUTES.EMPLOYEE.DASHBOARD
          : ROUTES.ADMIN.EMPLOYEES
        navigate(from || roleTarget, { replace: true })
      } else {
        setApiError('Unexpected response from server. Please try again.')
      }
    } catch (error) {
      const friendly = mapAuthError(error.message)
      setApiError(friendly)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white font-bold font-mono text-xl shadow-lg shadow-purple-200 transition-transform hover:scale-105 duration-200">
              D
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">DAYFLOW</h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Human Resource Management System</p>
          </div>
        </div>

        {/* Card */}
        <Card className="bg-white border-slate-200 text-slate-900 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-5 pt-6">
            <CardTitle className="text-lg font-bold text-slate-900">Welcome back</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Sign in to your workspace to continue.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5 pb-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {apiError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Email / Employee ID */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">
                  Email or Employee ID
                </Label>
                <Input
                  placeholder="name@company.com or OIJODO20260001"
                  leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                  className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  error={!!errors.login}
                  autoComplete="username"
                  {...register('login')}
                />
                {errors.login && <p className="text-[11px] text-red-500">{errors.login.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Password</Label>
                  <span className="text-xs text-slate-400 italic">Contact admin to reset</span>
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 pointer-events-auto cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  error={!!errors.password}
                  autoComplete="current-password"
                  {...register('password')}
                />
                {errors.password && <p className="text-[11px] text-red-500">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white shadow-sm py-2.5 rounded-lg font-bold uppercase tracking-wider text-xs transition-all duration-150 border-0 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center pt-4 pb-5 border-t border-slate-100 bg-slate-50/50 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Building2 className="h-3.5 w-3.5 text-purple-500" />
              <span>New to Dayflow?</span>
              <Link
                to={ROUTES.PUBLIC.COMPANY_SIGNUP}
                className="text-purple-600 font-semibold hover:underline hover:text-purple-700"
              >
                Register your company
              </Link>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-[11px] text-slate-400">
          Employees receive login credentials from their HR administrator.
        </p>
      </div>
    </div>
  )
}
