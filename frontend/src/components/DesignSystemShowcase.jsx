import React, { useState } from 'react'
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar as CalendarIcon,
  ChevronDown,
  Layers,
  Sliders,
  Type,
  Sun,
  Moon,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  FileText,
  User,
  ShieldCheck,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
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
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Calendar } from '@/components/ui/calendar'

export function DesignSystemShowcase() {
  const [isDark, setIsDark] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [inputValue, setInputValue] = useState('Sarah Jenkins')

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    if (!isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 transition-colors ${isDark ? 'dark bg-slate-950 text-slate-100' : ''}`}>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xs dark:bg-slate-900/95 dark:border-slate-800">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white font-bold shadow-xs">
              <span className="text-base tracking-tight font-mono">D</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Dayflow</span>
                <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
                  DESIGN SYSTEM
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Every workday, perfectly aligned.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              leftIcon={isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5 text-slate-600" />}
            >
              {isDark ? 'Light' : 'Dark'}
            </Button>
            <Badge variant="success" dot>Tokens Active</Badge>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Banner */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Enterprise Design Tokens & Component Primitives
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                A purpose-built foundation for Dayflow HRMS. Engineered for clarity, accessibility, and high productivity.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
                    Test Modal Dialog
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Enterprise Modal</DialogTitle>
                    <DialogDescription>
                      This dialog primitive supports smooth overlay animations, escape dismissal, and accessible focus management.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <Label required>Employee Note</Label>
                    <Input placeholder="Enter brief note..." />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" size="sm">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="default" size="sm">Confirm Action</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" leftIcon={<Sliders className="h-3.5 w-3.5" />}>
                    Test Side Sheet
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Slide-over Drawer</SheetTitle>
                    <SheetDescription>
                      Slide-out drawer container for context panes, filters, and employee profiles.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                    <div>
                      <Label>Selected Date</Label>
                      <div className="mt-1.5">
                        <Calendar selected={selectedDate} onSelect={setSelectedDate} />
                      </div>
                    </div>
                  </div>
                  <SheetFooter>
                    <SheetClose asChild>
                      <Button variant="default" size="sm">Close Sheet</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </section>

        {/* Core Showcase Tabs */}
        <Tabs defaultValue="components" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="badges">Badges & Status</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="table">Table & Lists</TabsTrigger>
          </TabsList>

          {/* Tab 1: Components (Buttons, Inputs, Cards, Dropdowns, Calendar) */}
          <TabsContent value="components" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Buttons & Actions</CardTitle>
                  <CardDescription>Primary, secondary, outline, destructive, and state buttons.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="default" size="sm">Primary</Button>
                    <Button variant="secondary" size="sm">Secondary</Button>
                    <Button variant="outline" size="sm">Outline</Button>
                    <Button variant="ghost" size="sm">Ghost</Button>
                    <Button variant="destructive" size="sm">Destructive</Button>
                    <Button variant="success" size="sm">Success</Button>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="default" size="sm" isLoading>Loading</Button>
                    <Button variant="outline" size="sm" disabled>Disabled</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" rightIcon={<ChevronDown className="h-3.5 w-3.5" />}>
                          Dropdown
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="left">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => alert('View Profile')}>
                          <User className="h-3.5 w-3.5" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert('Download Report')}>
                          <FileText className="h-3.5 w-3.5" /> Export Record
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem destructive onClick={() => alert('Deactivated')}>
                          <Trash2 className="h-3.5 w-3.5" /> Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Form Inputs */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Form Controls</CardTitle>
                  <CardDescription>Standard input, with icons, error states, and labels.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label required>Employee Name</Label>
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      leftIcon={<User className="h-4 w-4" />}
                    />
                  </div>
                  <div>
                    <Label>Work Email</Label>
                    <Input placeholder="name@company.com" />
                  </div>
                  <div>
                    <Label>Error Validation State</Label>
                    <Input defaultValue="invalid-entry" error />
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Calendar & Avatars */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Calendar & Avatars</CardTitle>
                  <CardDescription>Interactive day picker & multi-size avatar fallbacks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <Avatar size="default">
                      <AvatarFallback>NA</AvatarFallback>
                    </Avatar>
                    <Avatar size="md">
                      <AvatarFallback>DF</AvatarFallback>
                    </Avatar>
                    <Avatar size="lg">
                      <AvatarFallback className="bg-blue-600 text-white">HR</AvatarFallback>
                    </Avatar>
                  </div>
                  <Separator />
                  <div className="flex justify-center">
                    <Calendar selected={selectedDate} onSelect={setSelectedDate} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Badges & Status Tokens */}
          <TabsContent value="badges" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">HRMS Status Badges</CardTitle>
                <CardDescription>Tailored tokens for attendance, leave requests, payroll states, and roles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Present / Active</span>
                    <div>
                      <Badge variant="success" dot>Present</Badge>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Pending Review</span>
                    <div>
                      <Badge variant="warning" dot>Pending Approval</Badge>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Absent / Rejected</span>
                    <div>
                      <Badge variant="destructive" dot>Absent</Badge>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Leave / On Duty</span>
                    <div>
                      <Badge variant="info" dot>Annual Leave</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">Neutral</Badge>
                  <Badge variant="primary">Enterprise Primary</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline Badge</Badge>
                  <Badge variant="purple" dot>Executive</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Typography */}
          <TabsContent value="typography" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Typography Hierarchy</CardTitle>
                <CardDescription>Inter font family paired with crisp tabular numbers and strict contrast ratios.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1 border-b border-slate-100 pb-3">
                  <p className="text-xs text-slate-400 font-mono">H1 / 32px / Bold</p>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Every workday, perfectly aligned.
                  </h1>
                </div>

                <div className="space-y-1 border-b border-slate-100 pb-3">
                  <p className="text-xs text-slate-400 font-mono">H2 / 24px / Semibold</p>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    Employee Attendance & Leave Records
                  </h2>
                </div>

                <div className="space-y-1 border-b border-slate-100 pb-3">
                  <p className="text-xs text-slate-400 font-mono">H3 / 18px / Medium</p>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                    Departmental Summary & Overtime Calculations
                  </h3>
                </div>

                <div className="space-y-1 border-b border-slate-100 pb-3">
                  <p className="text-xs text-slate-400 font-mono">Body / 14px / Regular</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Dayflow provides continuous time tracking, seamless shift allocation, automated payroll reconciliations, and compliance validation.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-mono">Caption & Labels / 12px / Uppercase</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    LAST SYNCHRONIZED: 10:35 AM GMT+5:30
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Table */}
          <TabsContent value="table" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Data Table Primitive</CardTitle>
                <CardDescription>Clean enterprise table styling with responsive layout and status tags.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar size="xs">
                            <AvatarFallback>EM</AvatarFallback>
                          </Avatar>
                          <span>Eleanor Morgan</span>
                        </div>
                      </TableCell>
                      <TableCell>Engineering</TableCell>
                      <TableCell><Badge variant="success" dot>Present</Badge></TableCell>
                      <TableCell>09:00 - 18:00</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon-sm">
                          <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                        </Button>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar size="xs">
                            <AvatarFallback>MC</AvatarFallback>
                          </Avatar>
                          <span>Marcus Chen</span>
                        </div>
                      </TableCell>
                      <TableCell>Human Resources</TableCell>
                      <TableCell><Badge variant="warning" dot>Pending Leave</Badge></TableCell>
                      <TableCell>10:00 - 19:00</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon-sm">
                          <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                        </Button>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar size="xs">
                            <AvatarFallback>AL</AvatarFallback>
                          </Avatar>
                          <span>Amina Larsson</span>
                        </div>
                      </TableCell>
                      <TableCell>Operations</TableCell>
                      <TableCell><Badge variant="info" dot>On Leave</Badge></TableCell>
                      <TableCell>—</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon-sm">
                          <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
