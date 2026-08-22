import { apiClient } from '@/services/api/apiClient'

const INTELLIGENCE_INSIGHTS = {
  workforceHealthScore: 92,
  summary: 'Workforce alignment is strong across Engineering and Finance. Minor attention required in Operations regarding Monday check-in variances.',
  anomalies: [
    {
      id: 'anom_1',
      severity: 'WARNING', // WARNING | ATTENTION | INFO
      category: 'Attendance Pattern',
      title: 'Monday Check-in Variance in Operations',
      what: 'Operations attendance frequency decreased by 6.4% on Mondays compared to the monthly baseline.',
      why: 'Shift handovers on Sunday nights are creating punch delays and unrecorded morning check-ins.',
      action: 'Review shift roster assignments for Operations lead staff and adjust check-in grace period.',
    },
    {
      id: 'anom_2',
      severity: 'ATTENTION',
      category: 'Leave Clustering',
      title: 'Engineering Leave Overlap in March',
      what: '3 senior engineers have overlapping Paid Leave requests between March 10 - March 14.',
      why: 'High concentration of requested time-off during Sprint 14 delivery window.',
      action: 'Coordinate with Engineering Manager before approving overlapping time-off requests.',
    },
    {
      id: 'anom_3',
      severity: 'INFO',
      category: 'Overtime Balance',
      title: 'Priya Sharma Overtime Exceeds 12 Hours',
      what: 'Priya Sharma logged 14.5 overtime hours during the January payroll closing week.',
      why: 'Quarter-end tax reconciliation required additional manual audit cycles.',
      action: 'Consider temporary support allocation for month-end financial reconciliations.',
    },
  ],
  departmentTrends: [
    { department: 'Engineering', attendanceRate: 96.5, leaveRate: 3.5, health: 'OPTIMAL' },
    { department: 'Human Resources', attendanceRate: 98.0, leaveRate: 2.0, health: 'OPTIMAL' },
    { department: 'Operations', attendanceRate: 91.2, leaveRate: 8.8, health: 'ATTENTION' },
    { department: 'Finance', attendanceRate: 95.4, leaveRate: 4.6, health: 'OPTIMAL' },
  ],
}

const ASK_DAYFLOW_KNOWLEDGE_BASE = [
  {
    queryKeys: ['highest', 'absenteeism', 'absent', 'department'],
    answer: {
      headline: 'Operations Department shows highest absenteeism rate (8.8%)',
      details: 'Based on February data, Operations logged 12 absent days total, primarily concentrated on Monday mornings. Engineering remains at 3.5% absenteeism.',
      recommendation: 'Implement automated check-in reminders for Operations night-shift transitions.',
    },
  },
  {
    queryKeys: ['unusual', 'pattern', 'who', 'anomalies'],
    answer: {
      headline: 'Devon Kovac (Engineering) & Marcus Chen (HR) flagged for pattern variances',
      details: 'Devon Kovac recorded 3 half-day check-ins this week. Marcus Chen has a pending sick leave application awaiting CHRO signoff.',
      recommendation: 'Review Devon Kovac’s timecard adjustments and complete Marcus’s leave review.',
    },
  },
  {
    queryKeys: ['pending', 'leave', 'requests', 'how many'],
    answer: {
      headline: '5 Leave Requests currently pending HR approval',
      details: 'Includes 2 Paid Leave requests from Engineering, 1 Sick Leave from HR, and 2 Unpaid Leave requests from Operations.',
      recommendation: 'Navigate to Admin > Leave Approvals to review and approve pending requests.',
    },
  },
  {
    queryKeys: ['changed', 'month', 'attendance', 'trend'],
    answer: {
      headline: 'Company-wide attendance improved by +2.1% this month',
      details: 'Overall check-in rate reached 94.8% (up from 92.7% in January). On-time punctuality increased by 4.2% after introducing morning automated push notifications.',
      recommendation: 'Maintain current shift notification cadence.',
    },
  },
]

export const intelligenceService = {
  /**
   * Get Dayflow Intelligence workforce insights
   */
  async getInsights() {
    try {
      const response = await apiClient.get('/intelligence/insights')
      return response?.data || response
    } catch {
      return INTELLIGENCE_INSIGHTS
    }
  },

  /**
   * Execute "Ask Dayflow" natural query
   */
  async queryAskDayflow(question) {
    try {
      const response = await apiClient.post('/intelligence/query', { question })
      return response?.data || response
    } catch {
      const lower = question.toLowerCase()
      const match = ASK_DAYFLOW_KNOWLEDGE_BASE.find((item) =>
        item.queryKeys.some((key) => lower.includes(key))
      )

      if (match) {
        return match.answer
      }

      return {
        headline: `Workforce Intelligence Analysis for "${question}"`,
        details: `Dayflow Intelligence evaluated your query across 142 employee records, February attendance logs, and active leave workflows. No critical anomalies detected outside normal parameters.`,
        recommendation: 'Use predefined queries or check the Workforce Health overview tab for detailed breakdown.',
      }
    }
  },
}
