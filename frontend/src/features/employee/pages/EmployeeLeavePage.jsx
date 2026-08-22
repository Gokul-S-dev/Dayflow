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
} from '@/components/ui/dialog'
import { CalendarDays, Plus, Clock, CheckCircle2, XCircle, AlertCircle, Upload, FileText } from 'lucide-react'
import { toast } from 'sonner'

const leaveSchema = z.object({
  type: z.enum(['Paid Leave', 'Sick Leave', 'Unpaid Leave']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(5, 'Please provide a reason (at least 5 characters)'),
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: "End date must be on or after start date",
  path: ["endDate"]
});

function YearCalendar({ requests }) {
  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i);

  const getDayStatus = (dateStr) => {
    if (!requests) return null;
    const date = new Date(dateStr);
    date.setHours(0,0,0,0);
    
    let matchedStatus = null;
    let matchedType = null;
    
    requests.forEach(r => {
      const start = new Date(r.startDate);
      start.setHours(0,0,0,0);
      const end = new Date(r.endDate);
      end.setHours(0,0,0,0);
      
      if (date >= start && date <= end) {
        matchedStatus = r.status;
        matchedType = r.type;
      }
    });
    
    if (!matchedStatus) return null;
    return { status: matchedStatus, type: matchedType };
  };

  const getStatusColor = (dayStatus) => {
    if (!dayStatus) return 'bg-slate-50 hover:bg-slate-100/80 text-slate-700';
    if (dayStatus.status === 'APPROVED') {
      return dayStatus.type === 'Sick Leave' 
        ? 'bg-blue-600 text-white font-bold' 
        : 'bg-emerald-600 text-white font-bold';
    }
    if (dayStatus.status === 'PENDING') return 'bg-amber-400 text-slate-900 font-bold';
    if (dayStatus.status === 'REJECTED') return 'bg-rose-500 text-white font-bold';
    return 'bg-slate-50 hover:bg-slate-100/80 text-slate-700';
  };

  return (
    <Card className="mb-6 bg-white border-slate-200 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">12-Month Leave Calendar ({currentYear})</CardTitle>
            <CardDescription className="text-xs">Visual overview of your scheduled time off.</CardDescription>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-[10px] font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-600 border border-emerald-700/10 inline-block"></span>
              <span className="text-slate-600">Approved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-blue-600 border border-blue-700/10 inline-block"></span>
              <span className="text-slate-600">Sick</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-400 border border-amber-500/10 inline-block"></span>
              <span className="text-slate-600">Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500 border border-rose-600/10 inline-block"></span>
              <span className="text-slate-600">Rejected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-slate-50 border border-slate-200 inline-block"></span>
              <span className="text-slate-600">Normal</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {months.map(m => {
            const firstDay = new Date(currentYear, m, 1);
            const totalDays = new Date(currentYear, m + 1, 0).getDate();
            const startOffset = firstDay.getDay();
            const monthName = firstDay.toLocaleString('default', { month: 'long' });
            
            const daysArr = Array.from({ length: totalDays }, (_, i) => i + 1);
            const offsetArr = Array.from({ length: startOffset }, (_, i) => i);

            return (
              <div key={m} className="space-y-1.5">
                <span className="text-xs font-bold text-slate-800 tracking-wide block text-center border-b border-slate-100 pb-1">{monthName}</span>
                <div className="grid grid-cols-7 gap-0.5 text-[9px] font-bold text-center text-slate-400 mb-0.5">
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {offsetArr.map(offset => (
                    <div key={`offset-${offset}`} className="h-4 w-4 bg-transparent" />
                  ))}
                  {daysArr.map(day => {
                    const padMonth = String(m + 1).padStart(2, '0');
                    const padDay = String(day).padStart(2, '0');
                    const dateStr = `${currentYear}-${padMonth}-${padDay}`;
                    const dayStatus = getDayStatus(dateStr);
                    const colorClass = getStatusColor(dayStatus);
                    
                    return (
                      <div
                        key={day}
                        className={`h-4 w-4 rounded-xs flex items-center justify-center cursor-default transition-all select-none text-[8px] ${colorClass}`}
                        title={dayStatus ? `${dayStatus.type} - ${dayStatus.status}` : `${monthName} ${day}`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function EmployeeLeavePage() {
  const [balances, setBalances] = useState(null)
  const [requests, setRequests] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Sick certificate states
  const [certFile, setCertFile] = useState(null)
  const [isUploadingCert, setIsUploadingCert] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      type: 'Paid Leave',
    },
  })

  const selectedType = watch('type')
  const startDateVal = watch('startDate')
  const endDateVal = watch('endDate')

  // Calculate live duration
  const getDurationDays = () => {
    if (!startDateVal || !endDateVal) return 0
    const start = new Date(startDateVal)
    const end = new Date(endDateVal)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
    const diff = end - start
    if (diff < 0) return 0
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
  }

  const liveDuration = getDurationDays()

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
    if (selectedType === 'Sick Leave' && !certFile) {
      toast.error('Medical certificate is required for Sick Leave.')
      return
    }

    setSubmitting(true)
    try {
      const res = await leaveService.applyLeave({
        ...data,
        medicalCertificate: certFile ? certFile.name : undefined
      })
      toast.success(res.message || 'Leave request submitted for approval!')
      setDialogOpen(false)
      reset()
      setCertFile(null)
      // Reload list
      const updated = await leaveService.getLeaveRequests('ALL')
      setRequests(updated)
      // Reload balance
      const balData = await leaveService.getLeaveBalances()
      setBalances(balData)
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
        <Dialog open={dialogOpen} onOpenChange={(val) => {
          setDialogOpen(val)
          if (!val) {
            reset()
            setCertFile(null)
          }
        }}>
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

              {liveDuration > 0 && (
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-500 font-semibold">Total Duration:</span>
                  <Badge variant="purple" className="font-mono text-xs font-bold">{liveDuration} Days</Badge>
                </div>
              )}

              {/* Sick Leave Certificate Upload */}
              {selectedType === 'Sick Leave' && (
                <div className="space-y-1.5 p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
                  <Label required className="text-slate-700 text-xs font-semibold block">Medical Certificate</Label>
                  {!certFile ? (
                    <div className="flex items-center gap-2 mt-1">
                      <label className="cursor-pointer">
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                          <Upload className="h-3.5 w-3.5 text-slate-500" />
                          Choose File
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0]
                            if (file) {
                              setIsUploadingCert(true)
                              setTimeout(() => {
                                setCertFile(file)
                                setIsUploadingCert(false)
                                toast.success('Medical certificate attached.')
                              }, 600)
                            }
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-slate-400">PDF, JPG or PNG up to 5MB</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200 mt-1">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-purple-600 shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 truncate">{certFile.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          setCertFile(null)
                          toast.info('Medical certificate removed.')
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-[10px]"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                  {isUploadingCert && <p className="text-[10px] text-slate-500 mt-1 animate-pulse">Uploading certificate...</p>}
                </div>
              )}

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

      {/* 12-Month Leave Calendar Grid */}
      <YearCalendar requests={requests} />

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
