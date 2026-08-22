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
import { Building2, Mail, Lock, User, Phone, Upload, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

const companySignupSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  name: z
    .string()
    .min(2, 'Full Name is required')
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: 'Please enter both first name and last name',
    }),
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
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export function CompanySignupPage() {
  const navigate = useNavigate()
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
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
    resolver: zodResolver(companySignupSchema),
    defaultValues: {
      role: 'ADMIN',
    },
  })

  const selectedRole = watch('role')

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      
      // Parse Full Name into firstName and lastName
      const names = data.name.trim().split(/\s+/)
      const firstName = names[0]
      const lastName = names.slice(1).join(' ')

      formData.append('companyName', data.companyName)
      formData.append('firstName', firstName)
      formData.append('lastName', lastName)
      formData.append('email', data.email)
      formData.append('phone', data.phone)
      formData.append('password', data.password)
      formData.append('confirmPassword', data.confirmPassword)
      formData.append('role', data.role)

      if (logoFile) {
        formData.append('logo', logoFile)
      }

      await authService.signupCompany(formData)
      toast.success('Registration successful. Please check your email and verify your account.')
      navigate(ROUTES.PUBLIC.VERIFY_EMAIL)
    } catch (error) {
      toast.error(error.message || 'Company registration failed.')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-xl space-y-6">
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
              Establish your organization workspace and primary administrative credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Company Name & Logo */}
              <div className="space-y-1">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Company Name :-</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Acme Technologies Inc."
                    leftIcon={<Building2 className="h-4 w-4 text-slate-400" />}
                    className="flex-1 bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                    error={!!errors.companyName}
                    {...register('companyName')}
                  />
                  <label className="cursor-pointer shrink-0" title="Upload Logo">
                    <div className="h-9 w-9 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-900/35 transition-all duration-150">
                      <Upload className="h-4 w-4" />
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </label>
                </div>
                {errors.companyName && <p className="text-[11px] text-red-500">{errors.companyName.message}</p>}
                {logoPreview && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Selected logo:</span>
                    <img src={logoPreview} alt="Logo Preview" className="h-8 w-8 rounded-md object-cover border border-slate-200" />
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="space-y-1">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Name :-</Label>
                <Input
                  placeholder="Marcus Chen"
                  leftIcon={<User className="h-4 w-4 text-slate-400" />}
                  className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  error={!!errors.name}
                  {...register('name')}
                />
                {errors.name && <p className="text-[11px] text-red-500">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Email :-</Label>
                <Input
                  placeholder="marcus@acme.com"
                  leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                  className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  error={!!errors.email}
                  {...register('email')}
                />
                {errors.email && <p className="text-[11px] text-red-500">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Phone :-</Label>
                <Input
                  placeholder="+91 99887 76655"
                  leftIcon={<Phone className="h-4 w-4 text-slate-400" />}
                  className="bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                  error={!!errors.phone}
                  {...register('phone')}
                />
                {errors.phone && <p className="text-[11px] text-red-500">{errors.phone.message}</p>}
              </div>

              {/* Password */}
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

              {/* Confirm Password */}
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

              {/* Administrative Role Selection */}
              <div className="space-y-1.5">
                <Label className="text-slate-700 text-xs font-semibold tracking-wider block">Assign Role :-</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setValue('role', 'HR')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      selectedRole === 'HR'
                        ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    HR Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('role', 'ADMIN')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      selectedRole === 'ADMIN'
                        ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-4 bg-purple-600 hover:bg-purple-750 text-white shadow-xs py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition-colors duration-150 border-0"
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
