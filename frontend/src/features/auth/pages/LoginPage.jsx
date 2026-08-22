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
  const { setAuth } = useAuthStore()
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
      const userData = response?.data?.user
      const userToken = response?.data?.accessToken

      if (userData && userToken) {
        // Map user properties so that frontend names match
        const mappedUser = {
          id: userData.id,
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          role: userData.role
        }
        setAuth({
          user: mappedUser,
          token: userToken,
        })
        toast.success('Signed in successfully!')
        const targetPath = userData.role === ROLES.EMPLOYEE ? ROUTES.EMPLOYEE.DASHBOARD : ROUTES.ADMIN.EMPLOYEES
        navigate(from || targetPath, { replace: true })
      } else {
        setApiError('Invalid response format from server.')
      }
    } catch (error) {
      console.warn('Backend login failure:', error.message)
      setApiError(error.message || 'Login failed. Please verify your credentials.')
      toast.error(error.message || 'Could not authenticate with backend.')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-full max-w-[200px] items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-sm tracking-wider shadow-inner">
            App/Web Logo
          </div>
        </div>

        {/* Card */}
        <Card className="bg-white border-slate-200 text-slate-900 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">Sign in Page</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Enter your credentials to access your Dayflow workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {apiError && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{apiError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Login Id/Email :-</Label>
                <Input
                  placeholder="name@company.com or EMP-1001"
                  leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                  className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  error={!!errors.login}
                  {...register('login')}
                />
                {errors.login && <p className="text-[11px] text-red-500">{errors.login.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Password :-</Label>
                  <a href="#" className="text-xs text-purple-600 hover:text-purple-750 hover:underline">Forgot password?</a>
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 pointer-events-auto"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  error={!!errors.password}
                  {...register('password')}
                />
                {errors.password && <p className="text-[11px] text-red-500">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full mt-3 bg-purple-600 hover:bg-purple-750 text-white shadow-xs py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-colors duration-150 border-0"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                SIGN IN
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between w-full text-xs text-slate-500 pt-1">
              <Link to={ROUTES.PUBLIC.SIGNUP} className="hover:text-slate-800 hover:underline text-purple-600">
                Activate Account
              </Link>
              <Link to={ROUTES.PUBLIC.COMPANY_SIGNUP} className="text-purple-600 font-semibold hover:underline flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" /> Don't have an Account? Sign Up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
