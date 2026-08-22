import React from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, Mail, Lock, User, ArrowRight } from 'lucide-react'

export function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white font-mono font-bold text-lg mb-2 shadow-sm">
            D
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Register Your Organization</h1>
          <p className="text-xs text-slate-500">Every workday, perfectly aligned.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company Registration</CardTitle>
            <CardDescription className="text-xs">
              Create an administrative account for your company.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label required>Company Name</Label>
              <Input placeholder="Acme Technologies Inc." leftIcon={<Building2 className="h-4 w-4" />} />
            </div>
            <div className="space-y-1">
              <Label required>Admin Full Name</Label>
              <Input placeholder="Jane Doe" leftIcon={<User className="h-4 w-4" />} />
            </div>
            <div className="space-y-1">
              <Label required>Work Email</Label>
              <Input placeholder="jane@acme.com" leftIcon={<Mail className="h-4 w-4" />} />
            </div>
            <div className="space-y-1">
              <Label required>Password</Label>
              <Input type="password" placeholder="••••••••" leftIcon={<Lock className="h-4 w-4" />} />
            </div>
            <Button className="w-full mt-2" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Create Organization Account
            </Button>
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
