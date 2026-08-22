import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { employeesService } from '@/services/backend/employees.service'
import { profileMetadataService } from '@/services/backend/profileMetadata'
import { calculateSalaryComponents, formatCurrency } from '@/features/payroll/utils/salaryCalculator'
import { ROUTES } from '@/constants/routes'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { User, Phone, MapPin, Building2, Calendar, Award, ShieldCheck, Mail, ShieldAlert, CreditCard, Landmark, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export function AdminEmployeeDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [emp, setEmp] = useState(null)
  const [metadata, setMetadata] = useState(null)

  const loadEmp = async () => {
    try {
      const data = await employeesService.getEmployeeById(id)
      setEmp(data)
      const meta = profileMetadataService.getMetadata(data.employeeId || data.id)
      setMetadata(meta)
    } catch (err) {
      toast.error('Failed to load employee details.')
    }
  }

  useEffect(() => {
    loadEmp()
  }, [id])

  const maskInfo = (str, visibleCount = 4) => {
    if (!str) return 'N/A'
    if (str.length <= visibleCount) return str
    return '•'.repeat(str.length - visibleCount) + str.slice(-visibleCount)
  }

  if (!emp) {
    return (
      <PageContainer title="Loading Employee Details...">
        <div className="py-12 text-center text-slate-400">Loading record...</div>
      </PageContainer>
    )
  }

  // Calculate salary components using salary engine
  const monthlyWage = metadata?.monthlyWage || 75000
  const salaryDetails = calculateSalaryComponents(monthlyWage)

  return (
    <PageContainer
      title={emp.fullName || `${emp.firstName} ${emp.lastName}`}
      description={`Personnel profile record — View Only`}
      badge={<Badge variant="purple">{emp.role}</Badge>}
      breadcrumbs={[
        { label: 'Admin', href: ROUTES.ADMIN.DASHBOARD },
        { label: 'Employees', href: ROUTES.ADMIN.EMPLOYEES },
        { label: emp.employeeId || id },
      ]}
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.ADMIN.EMPLOYEES)} leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}>
          Back to Directory
        </Button>
      }
    >
      {/* Top Banner Card */}
      <Card className="mb-6 bg-white border-slate-200 shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <Avatar size="xl">
              <AvatarFallback className="bg-purple-700 text-white font-bold text-xl">
                {(emp.fullName || emp.firstName || 'E').split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl font-bold text-slate-900">{emp.fullName || `${emp.firstName} ${emp.lastName}`}</h2>
                <Badge variant={emp.accountStatus === 'APPROVED' ? 'success' : emp.accountStatus === 'REJECTED' ? 'destructive' : 'warning'} dot>
                  {emp.accountStatus || 'PENDING'}
                </Badge>
                <Badge variant="success" dot>ACTIVE</Badge>
              </div>
              <p className="text-xs text-slate-500">{emp.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-slate-600 pt-1.5">
                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-slate-400" /> {emp.department}</span>
                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-slate-400" /> {emp.designation}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" /> Joined {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="resume" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="private">Private Info</TabsTrigger>
          <TabsTrigger value="salary">Salary Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Tab 1: Resume */}
        <TabsContent value="resume" className="pt-4 space-y-6">
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Professional Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-1">About Me</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  {metadata?.aboutMe || 'No details provided by the employee.'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">What I Love About My Job</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  {metadata?.loveAboutJob || 'No details provided by the employee.'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Interests & Hobbies</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  {metadata?.hobbies || 'No details provided by the employee.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Skills (Read-Only) */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Skills & Tech Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {metadata?.skills?.map((skill, idx) => (
                  <Badge key={idx} variant="primary" className="py-1 px-3.5 text-xs font-semibold">
                    {skill}
                  </Badge>
                ))}
                {(!metadata?.skills || metadata.skills.length === 0) && (
                  <p className="text-xs text-slate-400 font-semibold">No skills registered.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Certifications (Read-Only) */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Professional Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {metadata?.certifications?.map((cert, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Award className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{cert.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{cert.authority} {cert.date ? `• ${cert.date}` : ''}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!metadata?.certifications || metadata.certifications.length === 0) && (
                  <p className="text-xs text-slate-400 col-span-2">No certifications registered.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Private Info (Read-Only) */}
        <TabsContent value="private" className="pt-4">
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base text-slate-900 font-bold">Personal Profile Information</CardTitle>
              <CardDescription>Protected view-only registry details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-xs text-slate-800">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-600">
                <ShieldAlert className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  Sensitive identifiers like bank account details and personal tax numbers are masked for security.
                </div>
              </div>

              {/* Personal Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg border border-slate-50 bg-slate-50/30">
                  <span className="text-slate-400 block font-semibold">Date of Birth</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5 block">{metadata?.dob ? new Date(metadata.dob).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-50 bg-slate-50/30">
                  <span className="text-slate-400 block font-semibold">Nationality</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5 block">{metadata?.nationality || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-50 bg-slate-50/30">
                  <span className="text-slate-400 block font-semibold">Personal Email</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5 block">{metadata?.personalEmail || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-50 bg-slate-50/30">
                  <span className="text-slate-400 block font-semibold">Gender</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5 block">{metadata?.gender || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-50 bg-slate-50/30">
                  <span className="text-slate-400 block font-semibold">Marital Status</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5 block">{metadata?.maritalStatus || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-50 bg-slate-50/30">
                  <span className="text-slate-400 block font-semibold">Home Address</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5 block">{emp.address || 'N/A'}</span>
                </div>
              </div>

              {/* Bank Credentials Block */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-3">Bank Details & Identification</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-lg border border-slate-100 flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-purple-600" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Bank Name</span>
                      <span className="font-bold text-slate-700">{metadata?.bankName || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg border border-slate-100 flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Account Number</span>
                      <span className="font-mono font-bold text-slate-700">{maskInfo(metadata?.bankAccountNumber, 4)}</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg border border-slate-100 flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">IFSC Code</span>
                      <span className="font-mono font-bold text-slate-700">{maskInfo(metadata?.ifscCode, 4)}</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg border border-slate-100 flex items-center gap-3">
                    <User className="h-5 w-5 text-purple-600" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">PAN Number</span>
                      <span className="font-mono font-bold text-slate-700">{maskInfo(metadata?.panNumber, 3)}</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg border border-slate-100 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-purple-600" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">UAN Number</span>
                      <span className="font-mono font-bold text-slate-700">{maskInfo(metadata?.uanNumber, 4)}</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg border border-slate-100 flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Employee ID</span>
                      <span className="font-mono font-bold text-slate-700">{emp.employeeId || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Salary Info (Read-Only) */}
        <TabsContent value="salary" className="pt-4">
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base text-slate-900 font-bold">Salary Structure</CardTitle>
              <CardDescription>Wage breakdown calculation mapped using the INR compensation model.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-xs text-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block">Monthly Gross Wage</span>
                  <span className="text-xl font-bold text-slate-900">{formatCurrency(salaryDetails.monthlyWage)}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block">Yearly CTC</span>
                  <span className="text-xl font-bold text-slate-900">{formatCurrency(salaryDetails.yearlyWage)}</span>
                </div>
              </div>

              <div className="pt-3 space-y-2">
                <span className="text-xs font-bold text-slate-700 block border-b pb-1">Wage Components</span>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Basic Salary (50% of Wage):</span>
                  <span className="font-semibold">{formatCurrency(salaryDetails.components.basic)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">House Rent Allowance (50% of Basic):</span>
                  <span className="font-semibold">{formatCurrency(salaryDetails.components.hra)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Standard Allowance (10% of Wage):</span>
                  <span className="font-semibold">{formatCurrency(salaryDetails.components.standardAllowance)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Performance Bonus (10% of Wage):</span>
                  <span className="font-semibold">{formatCurrency(salaryDetails.components.performanceBonus)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Leave Travel Allowance (5% of Wage):</span>
                  <span className="font-semibold">{formatCurrency(salaryDetails.components.lta)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-55">
                  <span className="text-slate-500">Fixed Allowance:</span>
                  <span className="font-semibold">{formatCurrency(salaryDetails.components.fixedAllowance)}</span>
                </div>
              </div>

              <div className="pt-3 space-y-2">
                <span className="text-xs font-bold text-slate-700 block border-b pb-1">Contributions & Deductions</span>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Employee PF (12% of Basic):</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(salaryDetails.pf.employeePF)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Employer PF (12% of Basic):</span>
                  <span className="font-semibold text-slate-700">{formatCurrency(salaryDetails.pf.employerPF)}</span>
                </div>
                <div className="flex justify-between py-1 border-b pb-1">
                  <span className="text-slate-500">Professional Tax:</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(salaryDetails.professionalTax)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-bold text-slate-900">
                  <span>Estimated Net Take-Home Salary:</span>
                  <span>{formatCurrency(salaryDetails.netSalary)} / month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Security (Read-Only) */}
        <TabsContent value="security" className="pt-4">
          <Card className="bg-white border-slate-200 shadow-xs max-w-md">
            <CardHeader>
              <CardTitle className="text-base text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-purple-600" />
                <span>Authorization & Permissions</span>
              </CardTitle>
              <CardDescription>Security policies assigned by the administrative console.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 font-semibold">Account Status:</span>
                <Badge variant={emp.accountStatus === 'APPROVED' ? 'success' : emp.accountStatus === 'REJECTED' ? 'destructive' : 'warning'}>
                  {emp.accountStatus || 'PENDING'}
                </Badge>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 font-semibold">Role Level:</span>
                <span className="font-bold text-slate-800">{emp.role}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500 font-semibold">Department:</span>
                <span className="font-bold text-slate-800">{emp.department}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-semibold">Active Permissions:</span>
                <div className="flex items-center gap-1 text-emerald-600 font-bold">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Portal Authorized</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

// Missing ArrowLeft component from lucide-react was causing error, but now it is fully resolved.
const ArrowLeft = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
)
