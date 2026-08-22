import React, { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { useAuthStore } from '@/store/authStore'
import { employeesService } from '@/services/backend/employees.service'
import { profileMetadataService } from '@/services/backend/profileMetadata'
import { calculateSalaryComponents, formatCurrency } from '@/features/payroll/utils/salaryCalculator'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { User, Phone, MapPin, Building2, Calendar, Lock, Edit2, Save, Plus, X, Award, ShieldAlert, Key } from 'lucide-react'
import { toast } from 'sonner'
import { ROLES } from '@/constants/roles'
import { authService } from '@/services/backend/auth.service'

export function EmployeeProfilePage() {
  const { user } = useAuthStore()
  const userId = user?.id || user?._id

  const [profile, setProfile] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Skill input state
  const [newSkill, setNewSkill] = useState('')

  // Cert input state
  const [certName, setCertName] = useState('')
  const [certAuth, setCertAuth] = useState('')
  const [certDate, setCertDate] = useState('')

  // Main editable form fields
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    aboutMe: '',
    loveAboutJob: '',
    hobbies: '',
    dob: '',
    nationality: '',
    personalEmail: '',
    gender: '',
    maritalStatus: '',
    bankAccountNumber: '',
    bankName: '',
    ifscCode: '',
    panNumber: '',
    uanNumber: '',
  })

  const loadProfile = async () => {
    if (!userId) return
    try {
      const emp = await employeesService.getEmployeeById(userId)
      setProfile(emp)
      
      const meta = profileMetadataService.getMetadata(emp.employeeId || emp.id)
      setMetadata(meta)

      setFormData({
        phone: emp.phone || '',
        address: emp.address || '',
        aboutMe: meta.aboutMe || '',
        loveAboutJob: meta.loveAboutJob || '',
        hobbies: meta.hobbies || '',
        dob: meta.dob || '',
        nationality: meta.nationality || '',
        personalEmail: meta.personalEmail || '',
        gender: meta.gender || '',
        maritalStatus: meta.maritalStatus || '',
        bankAccountNumber: meta.bankAccountNumber || '',
        bankName: meta.bankName || '',
        ifscCode: meta.ifscCode || '',
        panNumber: meta.panNumber || '',
        uanNumber: meta.uanNumber || '',
      })
    } catch (err) {
      toast.error('Failed to load profile details.')
    }
  }

  useEffect(() => {
    loadProfile()
  }, [userId])

  const handleSave = async () => {
    setSaving(true)
    try {
      // 1. Update Core user profile fields
      await employeesService.updateEmployee(userId, {
        phone: formData.phone,
        address: formData.address,
      })

      // 2. Save extended profile metadata
      const empId = profile?.employeeId || profile?.id
      const updatedMeta = {
        ...metadata,
        aboutMe: formData.aboutMe,
        loveAboutJob: formData.loveAboutJob,
        hobbies: formData.hobbies,
        dob: formData.dob,
        nationality: formData.nationality,
        personalEmail: formData.personalEmail,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        bankAccountNumber: formData.bankAccountNumber,
        bankName: formData.bankName,
        ifscCode: formData.ifscCode,
        panNumber: formData.panNumber,
        uanNumber: formData.uanNumber,
      }
      profileMetadataService.saveMetadata(empId, updatedMeta)
      setMetadata(updatedMeta)

      toast.success('Profile information updated successfully!')
      setIsEditing(false)
      await loadProfile()
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddSkill = () => {
    if (!newSkill.trim()) return
    const empId = profile?.employeeId || profile?.id
    const updatedSkills = [...(metadata.skills || []), newSkill.trim()]
    const updatedMeta = { ...metadata, skills: updatedSkills }
    profileMetadataService.saveMetadata(empId, updatedMeta)
    setMetadata(updatedMeta)
    setNewSkill('')
    toast.success('Skill added successfully!')
  }

  const handleRemoveSkill = (skillToRemove) => {
    const empId = profile?.employeeId || profile?.id
    const updatedSkills = (metadata.skills || []).filter(s => s !== skillToRemove)
    const updatedMeta = { ...metadata, skills: updatedSkills }
    profileMetadataService.saveMetadata(empId, updatedMeta)
    setMetadata(updatedMeta)
    toast.success('Skill removed.')
  }

  const handleAddCert = () => {
    if (!certName.trim() || !certAuth.trim()) {
      toast.error('Please enter both name and issuing authority')
      return
    }
    const empId = profile?.employeeId || profile?.id
    const newCert = { name: certName.trim(), authority: certAuth.trim(), date: certDate }
    const updatedCerts = [...(metadata.certifications || []), newCert]
    const updatedMeta = { ...metadata, certifications: updatedCerts }
    profileMetadataService.saveMetadata(empId, updatedMeta)
    setMetadata(updatedMeta)
    
    setCertName('')
    setCertAuth('')
    setCertDate('')
    toast.success('Certification added!')
  }

  const handleRemoveCert = (idxToRemove) => {
    const empId = profile?.employeeId || profile?.id
    const updatedCerts = (metadata.certifications || []).filter((_, idx) => idx !== idxToRemove)
    const updatedMeta = { ...metadata, certifications: updatedCerts }
    profileMetadataService.saveMetadata(empId, updatedMeta)
    setMetadata(updatedMeta)
    toast.success('Certification removed.')
  }

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    setPasswordLoading(true)
    try {
      await authService.changePassword(currentPassword, newPassword, confirmPassword)
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err.message || 'Failed to change password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const maskInfo = (str, visibleCount = 4) => {
    if (!str) return 'N/A'
    if (isEditing) return str
    if (str.length <= visibleCount) return str
    return '•'.repeat(str.length - visibleCount) + str.slice(-visibleCount)
  }

  const userRole = user?.role || ROLES.EMPLOYEE
  const isAdmin = userRole === ROLES.ADMIN

  // Recalculate salary details based on metadata base pay
  const salaryDetails = calculateSalaryComponents(metadata?.monthlyWage || 75000)

  return (
    <PageContainer
      title="My Profile"
      description="View details, resume information, and edit contact properties."
      badge={<Badge variant="purple">{profile?.employeeId || 'EMP-LOAD'}</Badge>}
      breadcrumbs={[
        { label: 'Portal' },
        { label: 'My Profile' },
      ]}
      actions={
        isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button variant="default" size="sm" isLoading={saving} onClick={handleSave} leftIcon={<Save className="h-3.5 w-3.5" />}>
              Save Changes
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} leftIcon={<Edit2 className="h-3.5 w-3.5" />}>
            Edit Profile
          </Button>
        )
      }
    >
      {/* Profile Header Card */}
      <Card className="mb-6 bg-white border-slate-200 shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <Avatar size="xl">
              <AvatarFallback className="bg-purple-700 text-white font-bold text-xl">
                {(profile?.fullName || user?.name || 'E').split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl font-bold text-slate-900">{profile?.fullName || user?.name || 'Staff User'}</h2>
                <Badge variant="purple">{profile?.role || 'Employee'}</Badge>
              </div>
              <p className="text-xs text-slate-500">{profile?.email || user?.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-slate-600 pt-2">
                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-slate-400" /> {profile?.department || 'General'}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" /> Joined {profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-400" /> {profile?.phone || 'No phone'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="resume" className="w-full">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'} max-w-lg`}>
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="private">Private Info</TabsTrigger>
          {isAdmin && <TabsTrigger value="salary">Salary Info</TabsTrigger>}
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
                <Label className="font-bold text-slate-700 block mb-1">About Me</Label>
                {isEditing ? (
                  <textarea
                    className="w-full min-h-[70px] rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    value={formData.aboutMe}
                    onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                  />
                ) : (
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{formData.aboutMe || 'Add personal bio...'}</p>
                )}
              </div>

              <div>
                <Label className="font-bold text-slate-700 block mb-1">What I Love About My Job</Label>
                {isEditing ? (
                  <textarea
                    className="w-full min-h-[70px] rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    value={formData.loveAboutJob}
                    onChange={(e) => setFormData({ ...formData, loveAboutJob: e.target.value })}
                  />
                ) : (
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{formData.loveAboutJob || 'Add details...'}</p>
                )}
              </div>

              <div>
                <Label className="font-bold text-slate-700 block mb-1">Interests & Hobbies</Label>
                {isEditing ? (
                  <textarea
                    className="w-full min-h-[60px] rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                    value={formData.hobbies}
                    onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                  />
                ) : (
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{formData.hobbies || 'Add hobbies...'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills Management */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Skills & Tech Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {metadata?.skills?.map((skill, idx) => (
                  <Badge key={idx} variant="primary" className="py-1 px-3 flex items-center gap-1 text-xs">
                    <span>{skill}</span>
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-blue-500 hover:text-red-500 cursor-pointer">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {(!metadata?.skills || metadata.skills.length === 0) && (
                  <p className="text-xs text-slate-400 font-semibold">No skills added yet.</p>
                )}
              </div>

              <div className="flex gap-2 max-w-sm pt-2">
                <Input
                  placeholder="e.g. Docker, TypeScript"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="bg-white text-xs border-slate-200 text-slate-900"
                />
                <Button size="sm" onClick={handleAddSkill} leftIcon={<Plus className="h-3.5 w-3.5" />}>Add Skill</Button>
              </div>
            </CardContent>
          </Card>

          {/* Certifications Management */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Professional Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <button type="button" onClick={() => handleRemoveCert(idx)} className="text-slate-400 hover:text-red-500 p-1">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add certification form */}
              <div className="pt-4 border-t border-slate-100 space-y-3 max-w-lg">
                <span className="text-xs font-bold text-slate-700 block">Add New Certificate</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input placeholder="Cert Name" value={certName} onChange={(e) => setCertName(e.target.value)} className="bg-white text-xs border-slate-200 text-slate-900" />
                  <Input placeholder="Authority" value={certAuth} onChange={(e) => setCertAuth(e.target.value)} className="bg-white text-xs border-slate-200 text-slate-900" />
                  <Input type="date" value={certDate} onChange={(e) => setCertDate(e.target.value)} className="bg-white text-xs border-slate-200 text-slate-900" />
                </div>
                <Button size="sm" onClick={handleAddCert} leftIcon={<Plus className="h-3.5 w-3.5" />}>Add Certificate</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Private Info */}
        <TabsContent value="private" className="pt-4">
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base text-slate-900">Private Information</CardTitle>
              <CardDescription>Confidential details, masked during standard views for privacy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-250/50 flex items-start gap-2.5 text-[11px] text-amber-800">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-bold">Sensitive Record:</span> Personal identifiers, PAN numbers, and bank credentials are masked in view mode. Editing mode allows updates.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    disabled={!isEditing}
                    className="bg-white border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <Label>Nationality</Label>
                  <Input
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    disabled={!isEditing}
                    className="bg-white border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <Label>Personal Email</Label>
                  <Input
                    value={formData.personalEmail}
                    onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                    disabled={!isEditing}
                    className="bg-white border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 shadow-xs focus:outline-none disabled:opacity-60"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    disabled={!isEditing}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label>Marital Status</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 shadow-xs focus:outline-none disabled:opacity-60"
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                    disabled={!isEditing}
                  >
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
                <div>
                  <Label>Date of Joining</Label>
                  <Input
                    value={profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}
                    disabled
                    className="bg-slate-50 border-slate-200 text-slate-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Bank & Tax Identification</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Bank Name</Label>
                    <Input
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      disabled={!isEditing}
                      className="bg-white border-slate-200 text-slate-900"
                    />
                  </div>
                  <div>
                    <Label>Bank Account Number</Label>
                    <Input
                      value={maskInfo(formData.bankAccountNumber, 4)}
                      onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                      disabled={!isEditing}
                      className="bg-white border-slate-200 text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <Label>IFSC Code</Label>
                    <Input
                      value={maskInfo(formData.ifscCode, 4)}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                      disabled={!isEditing}
                      className="bg-white border-slate-200 text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <Label>PAN Number</Label>
                    <Input
                      value={maskInfo(formData.panNumber, 3)}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                      disabled={!isEditing}
                      className="bg-white border-slate-200 text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <Label>UAN Number</Label>
                    <Input
                      value={maskInfo(formData.uanNumber, 4)}
                      onChange={(e) => setFormData({ ...formData, uanNumber: e.target.value })}
                      disabled={!isEditing}
                      className="bg-white border-slate-200 text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <Label>Employee Code</Label>
                    <Input
                      value={profile?.employeeId || 'N/A'}
                      disabled
                      className="bg-slate-50 border-slate-200 text-slate-600 font-mono"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Salary Info (Admin only) */}
        {isAdmin && (
          <TabsContent value="salary" className="pt-4">
            <Card className="bg-white border-slate-200 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base text-slate-900">Compensation Breakdown</CardTitle>
                <CardDescription>Detailed calculations of basic and allowances configured in Odoo HRMS.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs text-slate-800">
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
                  <span className="text-xs font-bold text-slate-700 block border-b pb-1">Statutory Contributions & Deductions</span>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Employee Provident Fund (12% of Basic):</span>
                    <span className="font-semibold text-red-600">-{formatCurrency(salaryDetails.pf.employeePF)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Employer Provident Fund (12% of Basic):</span>
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
        )}

        {/* Tab 4: Security */}
        <TabsContent value="security" className="pt-4">
          <Card className="bg-white border-slate-200 shadow-xs max-w-lg">
            <CardHeader>
              <CardTitle className="text-base text-slate-900 flex items-center gap-1.5">
                <Key className="h-4 w-4 text-purple-600" />
                <span>Account Security</span>
              </CardTitle>
              <CardDescription>Update your password. Ensure it follows security regulations.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label required>Current Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <Label required>New Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <Label required>Confirm New Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900"
                  />
                </div>
                <Button type="submit" isLoading={passwordLoading} leftIcon={<Lock className="h-3.5 w-3.5" />}>
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
