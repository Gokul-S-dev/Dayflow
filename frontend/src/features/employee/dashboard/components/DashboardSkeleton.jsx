import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Attendance Control Skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 h-24 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-3 w-60 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="h-10 w-28 bg-slate-200 rounded-md" />
      </div>

      {/* Grid Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-slate-200 bg-white">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-slate-200 rounded" />
                      <div className="h-3 w-20 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-16 bg-slate-200 rounded-full" />
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between">
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
