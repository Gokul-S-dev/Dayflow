import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'
import { authService } from '@/services/backend/auth.service'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Minimum 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
  if (score <= 3) return { score, label: 'Fair', color: 'bg-amber-500' }
  if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500' }
  return { score, label: 'Strong', color: 'bg-emerald-500' }
}

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const { user, role, clearPasswordChangeFlag } = useAuthStore()
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  })

  const watchedNewPassword = watch('newPassword', '')
  const strength = getPasswordStrength(watchedNewPassword)

  const onSubmit = async (data) => {
    setIsLoading(true)
    setApiError(null)
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      clearPasswordChangeFlag()
      toast.success('Password changed successfully! Welcome to Dayflow.')
      const targetPath = role === ROLES.EMPLOYEE ? ROUTES.EMPLOYEE.DASHBOARD : ROUTES.ADMIN.EMPLOYEES
      navigate(targetPath, { replace: true })
    } catch (error) {
      const msg = error.message || 'Failed to change password.'
      const friendly = msg.includes('Incorrect current password') || msg.includes('current password')
        ? 'Your current password is incorrect. Please try again.'
        : 'Could not change password. Please try again.'
      setApiError(friendly)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleShow = (field) => setShow((prev) => ({ ...prev, [field]: !prev[field] }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white font-bold font-mono text-xl shadow-lg shadow-purple-200 transition-transform hover:scale-105 duration-200">
              D
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">DAYFLOW</h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Human Resource Management System</p>
          </div>
        </div>

        <Card className="bg-white border-slate-200 text-slate-900 shadow-md rounded-2xl overflow-hidden">
          {/* Header with security icon */}
          <CardHeader className="border-b border-slate-100 pb-5 pt-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Change your password</CardTitle>
              </div>
            </div>
            <CardDescription className="text-xs text-slate-500 leading-relaxed pl-12">
              Your administrator provided a temporary password. Please create a new secure password to continue.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5 pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {apiError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Current Password</Label>
                <Input
                  type={show.current ? 'text' : 'password'}
                  placeholder="Enter your current password"
                  leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => toggleShow('current')}
                      className="text-slate-400 hover:text-slate-600 pointer-events-auto cursor-pointer"
                    >
                      {show.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  error={!!errors.currentPassword}
                  {...register('currentPassword')}
                />
                {errors.currentPassword && <p className="text-[11px] text-red-500">{errors.currentPassword.message}</p>}
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">New Password</Label>
                <Input
                  type={show.new ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => toggleShow('new')}
                      className="text-slate-400 hover:text-slate-600 pointer-events-auto cursor-pointer"
                    >
                      {show.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  error={!!errors.newPassword}
                  {...register('newPassword')}
                />
                {errors.newPassword && <p className="text-[11px] text-red-500">{errors.newPassword.message}</p>}

                {/* Password Strength Meter */}
                {watchedNewPassword && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength.score ? strength.color : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[11px] font-semibold ${
                      strength.label === 'Strong' ? 'text-emerald-600' :
                      strength.label === 'Good' ? 'text-blue-600' :
                      strength.label === 'Fair' ? 'text-amber-600' : 'text-red-500'
                    }`}>
                      Password strength: {strength.label}
                    </p>
                  </div>
                )}

                {/* Requirements checklist */}
                {watchedNewPassword && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                    {[
                      { test: watchedNewPassword.length >= 8, label: 'At least 8 characters' },
                      { test: /[A-Z]/.test(watchedNewPassword), label: 'One uppercase letter' },
                      { test: /[a-z]/.test(watchedNewPassword), label: 'One lowercase letter' },
                      { test: /[0-9]/.test(watchedNewPassword), label: 'One number' },
                      { test: /[^A-Za-z0-9]/.test(watchedNewPassword), label: 'One special character' },
                    ].map(({ test, label }) => (
                      <div key={label} className="flex items-center gap-1">
                        <CheckCircle2 className={`h-3 w-3 ${test ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span className={`text-[10px] ${test ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Confirm New Password</Label>
                <Input
                  type={show.confirm ? 'text' : 'password'}
                  placeholder="Re-enter your new password"
                  leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => toggleShow('confirm')}
                      className="text-slate-400 hover:text-slate-600 pointer-events-auto cursor-pointer"
                    >
                      {show.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white shadow-sm py-2.5 rounded-lg font-bold uppercase tracking-wider text-xs transition-all duration-150 border-0"
                isLoading={isLoading}
              >
                {isLoading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-slate-400">
          Logged in as <span className="font-semibold text-slate-600">{user?.email || user?.name}</span>
        </p>
      </div>
    </div>
  )
}
