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
import { ShieldCheck, Mail, Lock, User, ArrowRight, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

const employeeSignupSchema = z.object({
  employeeId: z.string().min(3, 'Employee ID is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['EMPLOYEE', 'HR']),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export function SignupPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSignupSchema),
    defaultValues: {
      role: 'EMPLOYEE',
    },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await authService.signupEmployee({
        employeeId: data.employeeId,
        email: data.email,
        password: data.password,
        role: data.role,
      })
      toast.success('Account activated successfully! You can now sign in.')
      navigate(ROUTES.PUBLIC.LOGIN)
    } catch (error) {
      toast.error(error.message || 'Account activation failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white font-mono font-bold text-lg mb-2 shadow-sm">
            D
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activate Your Account</h1>
          <p className="text-xs text-slate-500">Every workday, perfectly aligned.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Employee Portal Activation</CardTitle>
            <CardDescription className="text-xs">
              Enter your credentials provisioned by HR or Admin to register.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label required>Employee ID</Label>
                <Input
                  placeholder="OIJODO20260002"
                  leftIcon={<ShieldCheck className="h-4 w-4" />}
                  error={!!errors.employeeId}
                  {...register('employeeId')}
                />
                {errors.employeeId && <p className="text-[11px] text-red-500">{errors.employeeId.message}</p>}
              </div>

              <div className="space-y-1">
                <Label required>Work Email</Label>
                <Input
                  placeholder="john.doe@example.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={!!errors.email}
                  {...register('email')}
                />
                {errors.email && <p className="text-[11px] text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <Label required>Assign Role</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setValue('role', 'EMPLOYEE')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-medium transition-all ${
                      selectedRole === 'EMPLOYEE'
                        ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="h-3.5 w-3.5" /> Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('role', 'HR')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-medium transition-all ${
                      selectedRole === 'HR'
                        ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck className="h-3.5 w-3.5" /> HR / Officer
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label required>Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={!!errors.password}
                  {...register('password')}
                />
                {errors.password && <p className="text-[11px] text-red-500">{errors.password.message}</p>}
              </div>

              <div className="space-y-1">
                <Label required>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && <p className="text-[11px] text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Activate Account
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 pt-4 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Already verified?{' '}
              <Link to={ROUTES.PUBLIC.LOGIN} className="text-blue-600 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
