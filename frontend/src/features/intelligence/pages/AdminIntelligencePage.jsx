import React, { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { intelligenceService } from '@/services/backend/intelligence.service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BrainCircuit, Sparkles, AlertTriangle, Info, CheckCircle2, Search, ArrowRight, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'

export function AdminIntelligencePage() {
  const [data, setData] = useState(null)
  const [queryInput, setQueryInput] = useState('')
  const [activeQueryResult, setActiveQueryResult] = useState(null)
  const [queryLoading, setQueryLoading] = useState(false)

  useEffect(() => {
    async function loadIntelligence() {
      try {
        const res = await intelligenceService.getInsights()
        setData(res)
      } catch (err) {
        console.error(err)
      }
    }
    loadIntelligence()
  }, [])

  const handleQuery = async (qText) => {
    const textToSubmit = qText || queryInput
    if (!textToSubmit.trim()) return

    setQueryLoading(true)
    try {
      const res = await intelligenceService.queryAskDayflow(textToSubmit)
      setActiveQueryResult(res)
      toast.success('Dayflow Intelligence generated contextual insight!')
    } catch (err) {
      toast.error('Query execution failed.')
    } finally {
      setQueryLoading(false)
    }
  }

  const sampleQuestions = [
    'Which department has the highest absenteeism?',
    'Who has unusual attendance patterns?',
    'How many leave requests are pending?',
    'What changed in attendance this month?',
  ]

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'WARNING':
        return <Badge variant="destructive" dot>Critical Warning</Badge>
      case 'ATTENTION':
        return <Badge variant="warning" dot>Needs Attention</Badge>
      case 'INFO':
        return <Badge variant="info" dot>Observation</Badge>
      default:
        return <Badge variant="secondary">{sev}</Badge>
    }
  }

  return (
    <PageContainer
      title="Dayflow Intelligence & Decision Support"
      description="Convert workforce data into actionable insights, anomaly alerts, and executive decision support."
      badge={<Badge variant="primary" dot>AI Assistant Active</Badge>}
      breadcrumbs={[
        { label: 'Admin' },
        { label: 'Intelligence' },
      ]}
    >
      {/* Workforce Health Score Banner */}
      <section className="mb-6 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-purple-200 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5" /> Workforce Alignment Score
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dayflow Intelligence Engine</h2>
            <p className="text-xs sm:text-sm text-purple-200 max-w-2xl">
              {data?.summary || 'Workforce alignment is strong across Engineering and Finance. Minor attention required in Operations regarding Monday check-in variances.'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-xs shrink-0 self-start md:self-auto">
            <div className="text-center">
              <span className="text-3xl font-extrabold text-white">{data?.workforceHealthScore || 92}</span>
              <span className="text-xs text-purple-200 block">/ 100 Health</span>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <Badge variant="success" className="text-xs py-1 px-3">OPTIMAL</Badge>
          </div>
        </div>
      </section>

      {/* Ask Dayflow Query Interface */}
      <Card className="mb-8 border-blue-200 bg-gradient-to-br from-blue-50/50 via-white to-slate-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-blue-700" />
            <span>Ask Dayflow — Natural HR Query Assistant</span>
          </CardTitle>
          <CardDescription>
            Ask contextual questions about workforce health, department attendance, or leave queues.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Which department has the highest absenteeism?"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <Button variant="default" isLoading={queryLoading} onClick={() => handleQuery()} rightIcon={<ArrowRight className="h-4 w-4" />}>
              Analyze
            </Button>
          </div>

          {/* Sample Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-semibold">Suggested Queries:</span>
            {sampleQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setQueryInput(q)
                  handleQuery(q)
                }}
                className="text-xs px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors shadow-2xs"
              >
                "{q}"
              </button>
            ))}
          </div>

          {/* Active Query Result Box */}
          {activeQueryResult && (
            <div className="mt-4 p-4 rounded-xl bg-white border border-blue-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                <span>{activeQueryResult.headline}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {activeQueryResult.details}
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 bg-blue-50/80 p-2.5 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                <span><strong className="uppercase tracking-wider font-bold">Recommended Action:</strong> {activeQueryResult.recommendation}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actionable Anomaly Breakdown (WHAT, WHY, ACTION) */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span>Detected Anomalies & Decision Support Cards</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(data?.anomalies || []).map((anom) => (
            <Card key={anom.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{anom.category}</span>
                  {getSeverityBadge(anom.severity)}
                </div>
                <CardTitle className="text-sm font-bold text-slate-900">{anom.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs flex-1">
                <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block mb-0.5">WHAT Happened</span>
                  <p className="text-slate-600">{anom.what}</p>
                </div>

                <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block mb-0.5">WHY It Matters</span>
                  <p className="text-slate-600">{anom.why}</p>
                </div>

                <div className="p-2.5 rounded-md bg-blue-50 border border-blue-100 text-blue-900">
                  <span className="font-bold uppercase tracking-wider text-[10px] block mb-0.5 text-blue-700">WHAT HR Can Do</span>
                  <p className="font-medium">{anom.action}</p>
                </div>
              </CardContent>
              <CardFooter className="pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Review anomaly details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
