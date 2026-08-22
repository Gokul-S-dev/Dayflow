import React from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, ArrowRight, Sparkles, Clock, Users } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-xs px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-mono font-bold">
              D
            </div>
            <span className="font-bold text-base text-slate-900 tracking-tight">Dayflow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to={ROUTES.PUBLIC.LOGIN}>
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to={ROUTES.PUBLIC.SIGNUP}>
              <Button variant="default" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2">
          <Badge variant="primary" dot>Production Architecture Initialized</Badge>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Every workday, <span className="text-blue-700">perfectly aligned.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Modern enterprise Human Resource Management System for attendance tracking, leave governance, seamless payroll, and workforce intelligence.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link to={ROUTES.EMPLOYEE.DASHBOARD}>
            <Button variant="default" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Employee Portal Preview
            </Button>
          </Link>
          <Link to={ROUTES.ADMIN.DASHBOARD}>
            <Button variant="outline" size="lg">
              Admin & HR Portal Preview
            </Button>
          </Link>
        </div>

        {/* Quick architecture highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 text-left">
          <Card>
            <CardHeader>
              <div className="h-8 w-8 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
                <Clock className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm">Attendance & Shifts</CardTitle>
              <CardDescription className="text-xs">Precision punch tracking and shift alignment.</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-8 w-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                <Users className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm">Employee Governance</CardTitle>
              <CardDescription className="text-xs">Directory, role hierarchies, and leave approvals.</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-8 w-8 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center mb-2">
                <Sparkles className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm">HR Intelligence</CardTitle>
              <CardDescription className="text-xs">Workforce analytics, forecasting, and insights.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 bg-white">
        © 2026 Dayflow HRMS. All rights reserved.
      </footer>
    </div>
  )
}
