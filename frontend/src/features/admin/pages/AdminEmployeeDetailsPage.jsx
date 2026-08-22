import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { employeesService } from '@/services/backend/employees.service'
import { ROUTES } from '@/constants/routes'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { User, Phone, MapPin, Building2, Calendar, Edit2, Save, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export function AdminEmployeeDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [emp, setEmp] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    async function loadEmp() {
      try {
        const data = await employeesService.getEmployeeById(id || 'EMP-1001')
        setEmp(data)
        setFormData({
          department: data.department || '',
          designation: data.designation || '',
          salary: data.salary || 100000,
          phone: data.phone || '',
          address: data.address || '',
        })
      } catch (err) {
        toast.error('Failed to load employee details.')
      }
    }
    loadEmp()
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      await employeesService.updateEmployee(id, formData)
      toast.success('Employee updated successfully via PATCH /api/v1/employees/:id!')
      setIsEditing(false)
      const reloaded = await employeesService.getEmployeeById(id)
      setEmp(reloaded)
    } catch (err) {
      toast.error('Failed to update employee.')
    } finally {
      setSaving(false)
    }
  }

  if (!emp) {
    return (
      <PageContainer title="Loading Employee Details...">
        <div className="py-12 text-center text-slate-400">Loading record...</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={emp.fullName || `${emp.firstName} ${emp.lastName}`}
      description={`Personnel record for Employee ID: ${emp.id || id}`}
      badge={<Badge variant="purple">{emp.role}</Badge>}
      breadcrumbs={[
        { label: 'Admin', href: ROUTES.ADMIN.DASHBOARD },
        { label: 'Employees', href: ROUTES.ADMIN.EMPLOYEES },
        { label: emp.id || id },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.ADMIN.EMPLOYEES)} leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}>
            Back to Directory
          </Button>
          {isEditing ? (
            <Button variant="default" size="sm" isLoading={saving} onClick={handleSave} leftIcon={<Save className="h-3.5 w-3.5" />}>
              Save Updates
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setIsEditing(true)} leftIcon={<Edit2 className="h-3.5 w-3.5" />}>
              Edit Record
            </Button>
          )}
        </div>
      }
    >
      {/* Banner */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar size="xl">
              <AvatarFallback className="bg-purple-700 text-white font-bold text-xl">
                {(emp.fullName || emp.firstName || 'E').split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{emp.fullName || `${emp.firstName} ${emp.lastName}`}</h2>
                <Badge variant="success" dot>ACTIVE</Badge>
              </div>
              <p className="text-xs text-slate-500">{emp.email}</p>
              <p className="text-xs text-purple-700 font-semibold mt-1">{emp.designation} — {emp.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="job">Job & Compensation</TabsTrigger>
          <TabsTrigger value="attendance">Attendance & Leave Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
              <CardDescription>Integrates GET & PATCH /api/v1/employees/:id.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job & Compensation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Designation</Label>
                  <Input
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Annual Base Salary ($)</Label>
                  <Input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attendance & Leave History Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Attendance rate for {emp.firstName}: 96.5% | 16 days Paid Leave available.</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
