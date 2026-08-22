import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ROUTES } from '@/constants/routes'
import { authService } from '@/services/backend/auth.service'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, User, UserCheck, ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

const signupSchema = z
  .object({
    employeeId: z.string().min(2, 'Employee ID is required'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Minimum 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
    role: z.enum(['EMPLOYEE', 'HR']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export function SignupPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'EMPLOYEE',
    },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await authService.signup({
        employeeId: data.employeeId,
        email: data.email,
        password: data.password,
        role: data.role,
      })
      toast.success('Registration successful. Please check your email and verify your account.')
      navigate(ROUTES.PUBLIC.VERIFY_EMAIL)
    } catch (error) {
      toast.error(error.message || 'Account activation failed.')
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
            <CardTitle className="text-base font-bold text-slate-900">Sign Up Page</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Enter your credentials provisioned by HR or Admin to register.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Employee ID :-</Label>
                <Input
                  placeholder="OIJODO20260002"
                  leftIcon={<ShieldCheck className="h-4 w-4 text-slate-400" />}
                  className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  error={!!errors.employeeId}
                  {...register('employeeId')}
                />
                {errors.employeeId && <p className="text-[11px] text-red-500">{errors.employeeId.message}</p>}
              </div>

              <div className="space-y-1">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Email :-</Label>
                <Input
                  placeholder="john.doe@example.com"
                  leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                  className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  error={!!errors.email}
                  {...register('email')}
                />
                {errors.email && <p className="text-[11px] text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Assign Role :-</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setValue('role', 'EMPLOYEE')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      selectedRole === 'EMPLOYEE'
                        ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('role', 'HR')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      selectedRole === 'HR'
                        ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    HR / Officer
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Password :-</Label>
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

              <div className="space-y-1">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Confirm Password :-</Label>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-slate-400 hover:text-slate-600 pointer-events-auto"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  error={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && <p className="text-[11px] text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full mt-3 bg-purple-600 hover:bg-purple-750 text-white shadow-xs py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-colors duration-150 border-0"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Sign Up
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 pt-4 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to={ROUTES.PUBLIC.LOGIN} className="text-purple-600 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
