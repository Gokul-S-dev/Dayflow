import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageContainer } from '@/components/layout/PageContainer'
import { leaveService } from '@/services/backend/leave.service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { CalendarDays, Plus, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const leaveSchema = z.object({
  type: z.enum(['Paid Leave', 'Sick Leave', 'Unpaid Leave']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(5, 'Please provide a reason (at least 5 characters)'),
})

export function EmployeeLeavePage() {
  const [balances, setBalances] = useState(null)
  const [requests, setRequests] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      type: 'Paid Leave',
    },
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [balData, reqData] = await Promise.all([
          leaveService.getLeaveBalances(),
          leaveService.getLeaveRequests('ALL'),
        ])
        setBalances(balData)
        setRequests(reqData)
      } catch (err) {
        console.error(err)
      }
    }
    loadData()
  }, [])

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const res = await leaveService.applyLeave(data)
      toast.success(res.message || 'Leave request submitted for approval!')
      setDialogOpen(false)
      reset()
      // Reload list
      const updated = await leaveService.getLeaveRequests('ALL')
      setRequests(updated)
    } catch (err) {
      toast.error('Failed to submit leave request.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success" dot>Approved</Badge>
      case 'PENDING':
        return <Badge variant="warning" dot>Pending Review</Badge>
      case 'REJECTED':
        return <Badge variant="destructive" dot>Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <PageContainer
      title="My Leave Requests"
      description="Apply for time off, view available leave quotas, and track manager approval statuses."
      badge={<Badge variant="info">Quota Active</Badge>}
      breadcrumbs={[
        { label: 'Employee' },
        { label: 'Leave' },
      ]}
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Apply for Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Time Off</DialogTitle>
              <DialogDescription>
                Submit a new leave application to HR and your manager.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label required>Leave Type</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  {...register('type')}
                >
                  <option value="Paid Leave">Paid Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label required>Start Date</Label>
                  <Input type="date" error={!!errors.startDate} {...register('startDate')} />
                  {errors.startDate && <p className="text-[11px] text-red-500">{errors.startDate.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label required>End Date</Label>
                  <Input type="date" error={!!errors.endDate} {...register('endDate')} />
                  {errors.endDate && <p className="text-[11px] text-red-500">{errors.endDate.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <Label required>Reason / Remarks</Label>
                <textarea
                  rows={3}
                  placeholder="Provide context for your leave request..."
                  className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  {...register('reason')}
                />
                {errors.reason && <p className="text-[11px] text-red-500">{errors.reason.message}</p>}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" size="sm" isLoading={submitting}>
                  Submit Application
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Leave Balance Quotas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid Annual Leave</span>
            <CardTitle className="text-2xl font-bold mt-1 text-slate-900">
              {balances?.paid?.available ?? 16} <span className="text-xs text-slate-400 font-normal">/ {balances?.paid?.total ?? 20} days</span>
            </CardTitle>
            <CardDescription className="text-xs">{balances?.paid?.used ?? 4} days used in 2026</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sick Leave</span>
            <CardTitle className="text-2xl font-bold mt-1 text-slate-900">
              {balances?.sick?.available ?? 8} <span className="text-xs text-slate-400 font-normal">/ {balances?.sick?.total ?? 10} days</span>
            </CardTitle>
            <CardDescription className="text-xs">{balances?.sick?.used ?? 2} days used in 2026</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-l-4 border-l-slate-400">
          <CardHeader className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unpaid Leave</span>
            <CardTitle className="text-2xl font-bold mt-1 text-slate-900">
              {balances?.unpaid?.available ?? 15} <span className="text-xs text-slate-400 font-normal">days available</span>
            </CardTitle>
            <CardDescription className="text-xs">{balances?.unpaid?.used ?? 0} days used</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            <span>Leave Application History</span>
          </CardTitle>
          <CardDescription>Track status and manager approvals for all your time-off applications.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-semibold text-slate-900">{req.type}</TableCell>
                  <TableCell>{req.startDate} to {req.endDate}</TableCell>
                  <TableCell className="font-mono text-xs">{req.days} days</TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-slate-600">{req.reason}</TableCell>
                  <TableCell className="text-xs text-slate-400">{req.appliedDate}</TableCell>
                  <TableCell className="text-right">{getStatusBadge(req.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
