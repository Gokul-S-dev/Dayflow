import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { authService } from '@/services/backend/auth.service'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { MailCheck, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState(token ? 'VERIFYING' : 'PENDING') // PENDING | VERIFYING | SUCCESS | ERROR
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) return

    async function verify() {
      setStatus('VERIFYING')
      try {
        const response = await authService.verifyEmail(token)
        setStatus('SUCCESS')
        setMessage(response?.message || 'Your email has been verified successfully!')
      } catch (error) {
        setStatus('ERROR')
        setMessage(error.message || 'Invalid or expired verification token.')
      }
    }

    verify()
  }, [token])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-1">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white font-mono font-bold text-lg mb-2 shadow-sm">
            D
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Email Verification</h1>
          <p className="text-xs text-slate-500">Every workday, perfectly aligned.</p>
        </div>

        <Card className="text-center border-slate-200 bg-white shadow-sm text-slate-950">
          {status === 'VERIFYING' && (
            <CardContent className="py-12 space-y-4">
              <Loader2 className="h-10 w-10 text-purple-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">Verifying your token with backend...</p>
            </CardContent>
          )}

          {status === 'SUCCESS' && (
            <>
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <CardTitle className="text-base text-emerald-600 font-bold">Email Verified!</CardTitle>
                <CardDescription className="text-xs max-w-xs mx-auto text-slate-500">
                  {message || 'Your account is active. You can now sign in to your Dayflow workspace.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={ROUTES.PUBLIC.LOGIN} className="w-full block">
                  <Button className="w-full bg-purple-600 hover:bg-purple-750 text-white border-0 shadow-xs py-2 rounded-lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Proceed to Sign In
                  </Button>
                </Link>
              </CardContent>
            </>
          )}

          {status === 'ERROR' && (
            <>
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <CardTitle className="text-base text-red-600 font-bold">Verification Failed</CardTitle>
                <CardDescription className="text-xs max-w-xs mx-auto text-red-500 font-medium">
                  {message}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={ROUTES.PUBLIC.LOGIN} className="w-full block">
                  <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50">
                    Return to Sign In
                  </Button>
                </Link>
              </CardContent>
            </>
          )}

          {status === 'PENDING' && (
            <>
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
                  <MailCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-base font-bold">Check Your Inbox</CardTitle>
                <CardDescription className="text-xs max-w-xs mx-auto text-slate-500">
                  We've sent a verification link to your corporate email address. Click the link in your email or proceed to Sign In.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to={ROUTES.PUBLIC.LOGIN} className="w-full block">
                  <Button className="w-full bg-purple-600 hover:bg-purple-750 text-white border-0 shadow-xs py-2 rounded-lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Proceed to Sign In
                  </Button>
                </Link>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
