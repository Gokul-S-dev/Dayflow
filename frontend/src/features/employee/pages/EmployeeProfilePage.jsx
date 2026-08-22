import React, { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { useAuthStore } from '@/store/authStore'
import { employeesService } from '@/services/backend/employees.service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { User, Phone, MapPin, Building2, Calendar, CreditCard, FileText, Edit2, Save, Upload, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export function EmployeeProfilePage() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    phone: '+1 (555) 234-5678',
    address: '452 Tech Parkway, San Francisco, CA',
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const emp = await employeesService.getEmployeeById('EMP-1001')
        setProfile(emp)
        setFormData({
          phone: emp.phone || '+1 (555) 234-5678',
          address: emp.address || '452 Tech Parkway, San Francisco, CA',
        })
      } catch (err) {
        console.error(err)
      }
    }
    loadProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await employeesService.updateEmployee('EMP-1001', formData)
      toast.success('Profile information updated successfully!')
      setIsEditing(false)
    } catch (err) {
      toast.error('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer
      title="My Profile"
      description="View corporate details and update your contact info."
      badge={<Badge variant="secondary">EMP-1001</Badge>}
      breadcrumbs={[
        { label: 'Employee' },
        { label: 'Profile' },
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
      {/* Top Profile Header Banner */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative">
              <Avatar size="xl">
                <AvatarFallback className="bg-blue-700 text-white font-bold text-xl">
                  {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'EM'}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{profile?.fullName || user?.name || 'Eleanor Morgan'}</h2>
                <Badge variant="primary">Senior Frontend Architect</Badge>
              </div>
              <p className="text-xs text-slate-500">{profile?.email || user?.email || 'eleanor.morgan@dayflow.io'}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-slate-600 pt-2">
                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-slate-400" /> Engineering</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" /> Joined Mar 15, 2023</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-400" /> {formData.phone}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="job">Job Info</TabsTrigger>
          <TabsTrigger value="salary">Salary Structure</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Tab 1: Personal Info */}
        <TabsContent value="personal" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
              <CardDescription>Contact details and home address. Editable fields are highlighted.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name (Read Only)</Label>
                  <Input value={profile?.fullName || 'Eleanor Morgan'} disabled />
                </div>
                <div>
                  <Label>Employee ID (Read Only)</Label>
                  <Input value="EMP-1001" disabled />
                </div>
                <div>
                  <Label required={isEditing}>Phone Number</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    leftIcon={<Phone className="h-4 w-4" />}
                  />
                </div>
                <div>
                  <Label>Work Email (Read Only)</Label>
                  <Input value={profile?.email || 'eleanor.morgan@dayflow.io'} disabled />
                </div>
              </div>
              <div>
                <Label required={isEditing}>Home Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  leftIcon={<MapPin className="h-4 w-4" />}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Job Info */}
        <TabsContent value="job" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job & Organizational Details</CardTitle>
              <CardDescription>Position, reporting manager, and department permissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <Input value="Engineering" disabled />
                </div>
                <div>
                  <Label>Designation</Label>
                  <Input value="Senior Frontend Architect" disabled />
                </div>
                <div>
                  <Label>Reporting Manager</Label>
                  <Input value="Alexandra Vance (CHRO)" disabled />
                </div>
                <div>
                  <Label>Work Location</Label>
                  <Input value="San Francisco HQ (Hybrid)" disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Salary */}
        <TabsContent value="salary" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Salary Structure Overview</CardTitle>
              <CardDescription>Base pay and allowances summary.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Annual Base Salary</p>
                  <p className="text-xl font-bold text-slate-900">$115,000 / year</p>
                </div>
                <Badge variant="success">Active Grade</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Documents */}
        <TabsContent value="documents" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Employee Documents</CardTitle>
              <CardDescription>Contracts, tax forms, and identification files.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Employment Contract 2023.pdf</p>
                    <p className="text-[11px] text-slate-400">Signed on Mar 15, 2023</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Download</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
