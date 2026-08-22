import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ROUTES } from '@/constants/routes'
import { authService } from '@/services/backend/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Building2, Mail, Lock, User, Phone, Upload, Eye, EyeOff,
  ArrowRight, X, CheckCircle2, AlertCircle, ImageIcon,
  Users, Clock, BarChart3, Shield
} from 'lucide-react'
import { toast } from 'sonner'

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

const companySignupSchema = z
  .object({
    companyName: z.string().min(2, 'Company name is required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(7, 'Valid phone number required'),
    password: z
      .string()
      .min(8, 'Minimum 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
    role: z.enum(['ADMIN', 'HR']),
  })
  .refine((data) => data.password === data.confirmPassword, {
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

const FEATURES = [
  { icon: Users, label: 'Employee Management', desc: 'Onboard and manage your entire workforce' },
  { icon: Clock, label: 'Attendance Tracking', desc: 'Real-time check-in/out and shift management' },
  { icon: BarChart3, label: 'Payroll Processing', desc: 'Automated salary and tax computations' },
  { icon: Shield, label: 'Role-Based Access', desc: 'Granular permissions for Admin, HR & Employees' },
]

export function CompanySignupPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoError, setLogoError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(companySignupSchema),
    defaultValues: { role: 'ADMIN' },
  })

  const selectedRole = watch('role')
  const watchedPassword = watch('password', '')
  const strength = getPasswordStrength(watchedPassword)

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    setLogoError(null)
    if (!file) return
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setLogoError('Please select a PNG, JPG, or WEBP image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError('File size must be under 5MB.')
      return
    }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setLogoError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    setApiError(null)
    try {
      const formData = new FormData()
      formData.append('companyName', data.companyName)
      formData.append('firstName', data.firstName)
      formData.append('lastName', data.lastName)
      formData.append('email', data.email)
      formData.append('phone', data.phone)
      formData.append('password', data.password)
      formData.append('confirmPassword', data.confirmPassword)
      formData.append('role', data.role)
      if (logoFile) formData.append('logo', logoFile)

      await authService.signupCompany(formData)
      toast.success('Workspace created! Please verify your email to sign in.')
      navigate(ROUTES.PUBLIC.VERIFY_EMAIL)
    } catch (error) {
      const msg = error.message || 'Company registration failed.'
      const friendly = msg.includes('already registered') || msg.includes('already exists')
        ? 'This email is already registered. Please sign in or use a different email.'
        : msg
      setApiError(friendly)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-slate-100 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">

          {/* ── LEFT: Branding Panel ─────────────────────────────── */}
          <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-purple-700 via-purple-600 to-violet-800 p-10 text-white overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
              <div className="absolute bottom-0 -left-16 w-56 h-56 bg-white/5 rounded-full" />
              <div className="absolute top-1/2 right-0 w-32 h-32 bg-white/5 rounded-full" />
            </div>

            {/* Logo + Title */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white font-bold font-mono text-lg shadow-lg">
                  D
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight">DAYFLOW</h1>
                  <p className="text-purple-200 text-[10px] font-semibold uppercase tracking-wider">HRMS</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold leading-tight mb-3">
                Create your Dayflow workspace
              </h2>
              <p className="text-purple-200 text-sm leading-relaxed">
                Manage your workforce from one intelligent HR platform. Everything your team needs, beautifully unified.
              </p>
            </div>

            {/* Features list */}
            <div className="relative z-10 space-y-4">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-purple-100" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-[11px] text-purple-300 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer quote */}
            <div className="relative z-10 pt-4 border-t border-white/20">
              <p className="text-purple-200 text-xs italic">
                "Every workday, perfectly aligned."
              </p>
            </div>
          </div>

          {/* ── RIGHT: Form Panel ────────────────────────────────── */}
          <div className="flex flex-col p-8 lg:p-10 overflow-y-auto max-h-screen">
            {/* Mobile brand (hidden on desktop) */}
            <div className="flex lg:hidden items-center gap-2 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white font-bold font-mono text-base shadow-md">D</div>
              <div>
                <p className="text-base font-bold text-slate-900 tracking-tight">DAYFLOW</p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">HRMS</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Create your workspace</h2>
              <p className="text-sm text-slate-500 mt-1">
                Set up your company and administrator account.
              </p>
            </div>

            {apiError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 mb-4">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1">

              {/* ── Company Logo Upload ── */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Company Logo</Label>
                {logoPreview ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-purple-200 bg-purple-50/50">
                    <img
                      src={logoPreview}
                      alt="Company logo preview"
                      className="h-14 w-14 rounded-lg object-cover border border-purple-200 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{logoFile?.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {(logoFile?.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors shrink-0"
                      aria-label="Remove logo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 group">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-purple-100 transition-colors">
                        <ImageIcon className="h-5 w-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-slate-600 group-hover:text-purple-700">
                          <Upload className="inline h-3 w-3 mr-1 -mt-0.5" />
                          Click to upload logo
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP · Max 5MB</p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </label>
                )}
                {logoError && <p className="text-[11px] text-red-500">{logoError}</p>}
              </div>

              {/* ── Company Name ── */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Company Name</Label>
                <Input
                  placeholder="Acme Technologies Inc."
                  leftIcon={<Building2 className="h-4 w-4 text-slate-400" />}
                  className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  error={!!errors.companyName}
                  {...register('companyName')}
                />
                {errors.companyName && <p className="text-[11px] text-red-500">{errors.companyName.message}</p>}
              </div>

              {/* ── First + Last Name ── */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-xs font-semibold tracking-wider block">First Name</Label>
                  <Input
                    placeholder="Marcus"
                    leftIcon={<User className="h-4 w-4 text-slate-400" />}
                    className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                    error={!!errors.firstName}
                    {...register('firstName')}
                  />
                  {errors.firstName && <p className="text-[11px] text-red-500">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Last Name</Label>
                  <Input
                    placeholder="Chen"
                    className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                    error={!!errors.lastName}
                    {...register('lastName')}
                  />
                  {errors.lastName && <p className="text-[11px] text-red-500">{errors.lastName.message}</p>}
                </div>
              </div>

              {/* ── Email ── */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Email Address</Label>
                <Input
                  placeholder="marcus@acme.com"
                  leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                  className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  error={!!errors.email}
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && <p className="text-[11px] text-red-500">{errors.email.message}</p>}
              </div>

              {/* ── Phone ── */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Phone Number</Label>
                <Input
                  placeholder="+91 99887 76655"
                  leftIcon={<Phone className="h-4 w-4 text-slate-400" />}
                  className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  error={!!errors.phone}
                  {...register('phone')}
                />
                {errors.phone && <p className="text-[11px] text-red-500">{errors.phone.message}</p>}
              </div>

              {/* ── Password ── */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Password</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 pointer-events-auto cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  error={!!errors.password}
                  autoComplete="new-password"
                  {...register('password')}
                />
                {errors.password && <p className="text-[11px] text-red-500">{errors.password.message}</p>}

                {/* Strength meter */}
                {watchedPassword && (
                  <div className="space-y-1.5">
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
                    <p className={`text-[10px] font-semibold ${
                      strength.label === 'Strong' ? 'text-emerald-600' :
                      strength.label === 'Good' ? 'text-blue-600' :
                      strength.label === 'Fair' ? 'text-amber-600' : 'text-red-500'
                    }`}>
                      Strength: {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* ── Confirm Password ── */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Confirm Password</Label>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-slate-400 hover:text-slate-600 pointer-events-auto cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  error={!!errors.confirmPassword}
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && <p className="text-[11px] text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              {/* ── Role Selection ── */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Administrator Role</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'ADMIN', label: 'Administrator', desc: 'Full system access' },
                    { value: 'HR', label: 'HR Manager', desc: 'People operations access' },
                  ].map(({ value, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setValue('role', value)}
                      className={`py-2.5 px-3 rounded-xl border text-left transition-all duration-150 ${
                        selectedRole === value
                          ? 'bg-purple-50 border-purple-300 shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`text-xs font-bold ${selectedRole === value ? 'text-purple-700' : 'text-slate-700'}`}>
                        {label}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${selectedRole === value ? 'text-purple-500' : 'text-slate-400'}`}>
                        {desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Submit Button ── */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white shadow-sm py-2.5 rounded-lg font-bold uppercase tracking-wider text-xs transition-all duration-150 border-0 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating workspace...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create Workspace <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <p className="text-center text-xs text-slate-500 pt-1">
                Already have an account?{' '}
                <Link to={ROUTES.PUBLIC.LOGIN} className="text-purple-600 font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
