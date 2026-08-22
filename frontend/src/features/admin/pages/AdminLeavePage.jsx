import React, { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { leaveService } from '@/services/backend/leave.service'
import { odooEmployees } from '@/services/odoo/employees'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { CalendarCheck, Check, X, ShieldAlert, Users } from 'lucide-react'
import { toast } from 'sonner'

export function AdminLeavePage() {
  const [requests, setRequests] = useState([])
  const [employees, setEmployees] = useState([])
  const [activeTab, setActiveTab] = useState('PENDING')
  const [selectedReq, setSelectedReq] = useState(null)
  const [actionType, setActionType] = useState(null) // 'APPROVE' | 'REJECT'
  const [remarks, setRemarks] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [reqData, empData] = await Promise.all([
        leaveService.getLeaveRequests('ALL'),
        odooEmployees.getEmployees(),
      ])
      setRequests(reqData)
      setEmployees(Array.isArray(empData) ? empData : [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleActionConfirm = async () => {
    if (!selectedReq || !actionType) return
    setActionLoading(true)
    try {
      if (actionType === 'APPROVE') {
        await leaveService.approveLeave(selectedReq.id, remarks)
        toast.success(`Leave request for ${selectedReq.employeeName} approved!`)
      } else {
        await leaveService.rejectLeave(selectedReq.id, remarks)
        toast.info(`Leave request for ${selectedReq.employeeName} rejected.`)
      }
      setSelectedReq(null)
      setActionType(null)
      setRemarks('')
      loadData()
    } catch (err) {
      toast.error('Failed to process leave action.')
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = requests.filter((r) => {
    if (activeTab === 'ALL' || activeTab === 'ALLOCATION') return true
    return r.status === activeTab
  })

  // Helper to dynamically calculate mock leave allocations per employee
  const getEmployeeAllocations = (emp) => {
    const empId = emp.employeeId || 'OIEMUS20260001'
    
    // Seeded profiles mapping
    const allocations = {
      'OIELMO20260002': { paidUsed: 4, sickUsed: 2, unpaidUsed: 0 },
      'OIMACH20260003': { paidUsed: 2, sickUsed: 1, unpaidUsed: 0 },
      'OIALVA20260005': { paidUsed: 5, sickUsed: 0, unpaidUsed: 0 },
      'OIEMUS20260001': { paidUsed: 3, sickUsed: 1, unpaidUsed: 1 },
    }

    const data = allocations[empId] || { 
      paidUsed: Math.abs(empId.charCodeAt(0) % 6),
      sickUsed: Math.abs(empId.charCodeAt(1) % 3),
      unpaidUsed: 0 
    }

    return [
      { type: 'Paid Annual Leave', allocated: 20, used: data.paidUsed, remaining: 20 - data.paidUsed },
      { type: 'Sick Leave', allocated: 10, used: data.sickUsed, remaining: 10 - data.sickUsed },
      { type: 'Unpaid Leave', allocated: '—', used: data.unpaidUsed, remaining: '—' }
    ]
  }

  return (
    <PageContainer
      title="Leave Approvals & Governance"
      description="Review employee leave applications, enforce department coverage policies, and manage approvals."
      badge={<Badge variant="warning" dot>{requests.filter((r) => r.status === 'PENDING').length} Pending</Badge>}
      breadcrumbs={[
        { label: 'Admin' },
        { label: 'Leave Approvals' },
      ]}
    >
      <Tabs defaultValue="PENDING" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-xl mb-4">
          <TabsTrigger value="PENDING">Pending ({requests.filter((r) => r.status === 'PENDING').length})</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
          <TabsTrigger value="ALLOCATION">Allocations</TabsTrigger>
          <TabsTrigger value="ALL">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {activeTab === 'ALLOCATION' ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>Employee Leave Allocations</span>
                </CardTitle>
                <CardDescription>Visual summary of time off limits, used days, and remaining balances per user.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead className="text-center">Allocated Days</TableHead>
                      <TableHead className="text-center">Used Days</TableHead>
                      <TableHead className="text-center">Remaining Days</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp) => {
                      const allocs = getEmployeeAllocations(emp)
                      return (
                        <React.Fragment key={emp.id || emp.employeeId}>
                          {allocs.map((alloc, idx) => (
                            <TableRow key={`${emp.employeeId}-${alloc.type}`} className={idx === 2 ? 'border-b-2 border-slate-100' : ''}>
                              {idx === 0 && (
                                <TableCell rowSpan={3} className="font-semibold text-slate-900 align-middle border-r border-slate-100 bg-slate-50/20">
                                  <div>
                                    <div className="font-bold">{emp.name || `${emp.firstName} ${emp.lastName}`}</div>
                                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{emp.employeeId}</div>
                                    <div className="text-[11px] text-slate-500 font-medium">{emp.department || 'Operations'}</div>
                                  </div>
                                </TableCell>
                              )}
                              <TableCell className="font-medium text-slate-700">{alloc.type}</TableCell>
                              <TableCell className="text-center font-mono font-bold text-slate-800">{alloc.allocated}</TableCell>
                              <TableCell className="text-center font-mono font-bold text-blue-600">{alloc.used} d</TableCell>
                              <TableCell className="text-center font-mono font-bold text-emerald-600">{alloc.remaining}</TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-purple-600" />
                  <span>Leave Applications</span>
                </CardTitle>
                <CardDescription>Review employee time-off requests.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                          No leave applications found in this status.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-semibold text-slate-900">
                            <div>
                              <span>{req.employeeName}</span>
                              <span className="text-[11px] block font-normal text-slate-400">{req.department}</span>
                            </div>
                          </TableCell>
                          <TableCell>{req.type}</TableCell>
                          <TableCell className="text-xs">{req.startDate} to {req.endDate}</TableCell>
                          <TableCell className="font-mono text-xs font-semibold">{req.days} d</TableCell>
                          <TableCell className="max-w-xs text-xs text-slate-600 truncate">{req.reason}</TableCell>
                          <TableCell className="text-xs text-slate-400">{req.appliedDate}</TableCell>
                          <TableCell className="text-right">
                            {req.status === 'PENDING' ? (
                              <div className="flex justify-end gap-1.5">
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedReq(req)
                                    setActionType('APPROVE')
                                  }}
                                  leftIcon={<Check className="h-3.5 w-3.5" />}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedReq(req)
                                    setActionType('REJECT')
                                  }}
                                  leftIcon={<X className="h-3.5 w-3.5" />}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <Badge variant={req.status === 'APPROVED' ? 'success' : 'destructive'} dot>
                                {req.status}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      {selectedReq && (
        <Dialog open={!!selectedReq} onOpenChange={() => {
          setSelectedReq(null)
          setActionType(null)
          setRemarks('')
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'APPROVE' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </DialogTitle>
              <DialogDescription>
                Confirm decision for {selectedReq.employeeName} ({selectedReq.type}, {selectedReq.days} days).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-700">
                <p><span className="font-bold">Reason:</span> "{selectedReq.reason}"</p>
                <p><span className="font-bold">Dates:</span> {selectedReq.startDate} to {selectedReq.endDate}</p>
              </div>

              <div className="space-y-1">
                <Label>Manager Remarks / Comment (Optional)</Label>
                <Input
                  placeholder="Add approval or rejection notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedReq(null)}>
                Cancel
              </Button>
              <Button
                variant={actionType === 'APPROVE' ? 'success' : 'destructive'}
                size="sm"
                isLoading={actionLoading}
                onClick={handleActionConfirm}
              >
                Confirm {actionType === 'APPROVE' ? 'Approval' : 'Rejection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PageContainer>
  )
}
