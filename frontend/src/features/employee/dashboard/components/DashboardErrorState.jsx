import React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function DashboardErrorState({
  title = 'Unable to load employee information.',
  description = 'Please try again.',
  onRetry,
}) {
  return (
    <Card className="border border-red-200 bg-red-50/50">
      <CardContent className="p-8 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-red-900">{title}</h4>
          <p className="text-xs text-red-600 max-w-sm mx-auto">{description}</p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            className="border-red-300 text-red-700 hover:bg-red-100 bg-white"
          >
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
