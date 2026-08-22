import React from 'react'
import { Users, FolderOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function DashboardEmptyState({
  title = 'No employees available',
  description = 'There are currently no employee records to display.',
}) {
  return (
    <Card className="border border-slate-200 bg-white">
      <CardContent className="p-8 text-center space-y-3">
        <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
          <FolderOpen className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{description}</p>
      </CardContent>
    </Card>
  )
}
