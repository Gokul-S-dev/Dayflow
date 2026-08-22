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

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth, setRole } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  const from = location.state?.from?.pathname || null

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: 'alexandra.vance@dayflow.io',
      password: 'Password123!',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setApiError(null)
    try {
      const response = await authService.login(data)
      if (response?.token || response?.user) {
        setAuth({
          user: response.user || { name: 'Verified User', email: data.login, role: ROLES.ADMIN },
          token: response.token || 'jwt-bearer-token',
        })
        toast.success('Signed in successfully!')
        const targetPath = response?.user?.role === ROLES.EMPLOYEE ? ROUTES.EMPLOYEE.DASHBOARD : ROUTES.ADMIN.DASHBOARD
        navigate(from || targetPath, { replace: true })
      }
    } catch (error) {
      console.warn('Backend login fallback to demo mode:', error.message)
      // If server is not running, provide informative error or allow demo sign in
      setApiError(error.message || 'Login failed. Please verify your credentials.')
      toast.error('Could not authenticate with backend. You can use the Quick Demo Sign In below.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoSignIn = (role) => {
    setRole(role)
    toast.success(`Signed in as ${role} (Demo Mode)`)
    if (role === ROLES.EMPLOYEE) {
      navigate(ROUTES.EMPLOYEE.DASHBOARD, { replace: true })
    } else {
      navigate(ROUTES.ADMIN.DASHBOARD, { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-1">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white font-mono font-bold text-lg mb-2 shadow-sm">
            D
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to Dayflow</h1>
          <p className="text-xs text-slate-500">Every workday, perfectly aligned.</p>
        </div>

        {/* Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Authentication</CardTitle>
            <CardDescription className="text-xs">
              Enter your corporate email or Employee ID.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {apiError && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              <div className="space-y-1">
                <Label required>Email or Employee ID</Label>
                <Input
                  placeholder="name@company.com or EMP-1001"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={!!errors.login}
                  {...register('login')}
                />
                {errors.login && <p className="text-[11px] text-red-500">{errors.login.message}</p>}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label required>Password</Label>
                  <a href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</a>
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 pointer-events-auto"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={!!errors.password}
                  {...register('password')}
                />
                {errors.password && <p className="text-[11px] text-red-500">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Sign In to Workspace
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-4 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
              Quick Demo Access
            </span>
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs bg-white"
                onClick={() => handleDemoSignIn(ROLES.EMPLOYEE)}
              >
                Demo Employee
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs bg-white"
                onClick={() => handleDemoSignIn(ROLES.ADMIN)}
              >
                Demo Admin/HR
              </Button>
            </div>
            <div className="flex items-center justify-between w-full text-xs text-slate-500 pt-1">
              <Link to={ROUTES.PUBLIC.SIGNUP} className="hover:text-slate-800">
                Activate Account
              </Link>
              <Link to={ROUTES.PUBLIC.COMPANY_SIGNUP} className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" /> Register Company
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
