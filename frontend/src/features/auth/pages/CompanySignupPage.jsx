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
import { Building2, Mail, Lock, User, Phone, Upload, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

const companySignupSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
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
      Object.keys(data).forEach((key) => formData.append(key, data[key]))
      if (logoFile) {
        formData.append('logo', logoFile)
      }

      await authService.signupCompany(formData)
      toast.success('Company registered successfully! You can now sign in.')
      navigate(ROUTES.PUBLIC.LOGIN)
    } catch (error) {
      toast.error(error.message || 'Company registration failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white font-mono font-bold text-lg mb-2 shadow-sm">
            D
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Register Your Company on Dayflow</h1>
          <p className="text-xs text-slate-500">Every workday, perfectly aligned.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company & Admin Provisioning</CardTitle>
            <CardDescription className="text-xs">
              Establish your organization workspace and primary administrative credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Company Details */}
              <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Organization Info</span>
                
                <div className="space-y-1">
                  <Label required>Company Name</Label>
                  <Input
                    placeholder="Acme Technologies Inc."
                    leftIcon={<Building2 className="h-4 w-4" />}
                    error={!!errors.companyName}
                    {...register('companyName')}
                  />
                  {errors.companyName && (
                    <p className="text-[11px] text-red-500">{errors.companyName.message}</p>
                  )}
                </div>

                {/* Company Logo Upload */}
                <div className="space-y-1">
                  <Label>Company Logo (Optional)</Label>
                  <div className="flex items-center gap-3">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo Preview" className="h-12 w-12 rounded-md object-cover border border-slate-200" />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-slate-200/60 border border-slate-300 border-dashed flex items-center justify-center text-slate-400">
                        <Upload className="h-5 w-5" />
                      </div>
                    )}
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
                        <Upload className="h-3.5 w-3.5" /> Upload Logo
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Admin Account Details */}
              <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Admin Credentials</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label required>First Name</Label>
                    <Input placeholder="Alexandra" leftIcon={<User className="h-4 w-4" />} error={!!errors.firstName} {...register('firstName')} />
                    {errors.firstName && <p className="text-[11px] text-red-500">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label required>Last Name</Label>
                    <Input placeholder="Vance" leftIcon={<User className="h-4 w-4" />} error={!!errors.lastName} {...register('lastName')} />
                    {errors.lastName && <p className="text-[11px] text-red-500">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label required>Corporate Email</Label>
                    <Input placeholder="alexandra@acme.com" leftIcon={<Mail className="h-4 w-4" />} error={!!errors.email} {...register('email')} />
                    {errors.email && <p className="text-[11px] text-red-500">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label required>Phone Number</Label>
                    <Input placeholder="+1 (555) 000-0000" leftIcon={<Phone className="h-4 w-4" />} error={!!errors.phone} {...register('phone')} />
                    {errors.phone && <p className="text-[11px] text-red-500">{errors.phone.message}</p>}
                  </div>
                </div>

                {/* Role selection */}
                <div className="space-y-1">
                  <Label required>Administrative Role</Label>
                  <div className="flex gap-3 pt-1">
                    <label
                      className={`flex-1 flex items-center justify-between p-2.5 rounded-md border cursor-pointer text-xs font-semibold transition-all ${
                        selectedRole === 'ADMIN' ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-2xs' : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input type="radio" value="ADMIN" {...register('role')} className="sr-only" />
                        <ShieldCheck className="h-4 w-4 text-purple-600" />
                        <span>Administrator</span>
                      </div>
                    </label>

                    <label
                      className={`flex-1 flex items-center justify-between p-2.5 rounded-md border cursor-pointer text-xs font-semibold transition-all ${
                        selectedRole === 'HR' ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs' : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input type="radio" value="HR" {...register('role')} className="sr-only" />
                        <User className="h-4 w-4 text-blue-600" />
                        <span>HR Manager</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label required>Password</Label>
                    <Input type="password" placeholder="••••••••" leftIcon={<Lock className="h-4 w-4" />} error={!!errors.password} {...register('password')} />
                    {errors.password && <p className="text-[11px] text-red-500">{errors.password.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label required>Confirm Password</Label>
                    <Input type="password" placeholder="••••••••" leftIcon={<Lock className="h-4 w-4" />} error={!!errors.confirmPassword} {...register('confirmPassword')} />
                    {errors.confirmPassword && <p className="text-[11px] text-red-500">{errors.confirmPassword.message}</p>}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Password must be at least 8 chars with uppercase, lowercase, number, and special character.
                </p>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Register Organization & Send Verification
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              Already registered?{' '}
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
