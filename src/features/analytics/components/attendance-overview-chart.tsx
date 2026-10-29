import { BarChart3 } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import type { AttendanceStatus, AnalyticsOverview } from '../api/use-analytics-query'

interface AttendanceOverviewChartProps {
  rows: AnalyticsOverview['attendanceOverview']
}

const STATUS_ORDER: AttendanceStatus[] = ['present', 'late', 'absent', 'leave']

// Matches the status tones used across the product (StatusBadge) — present is
// good, late is a warning, absent is the serious case, leave is informational.
const STATUS_META: Record<AttendanceStatus, { label: string; colorClass: string }> = {
  present: { label: 'Present', colorClass: 'bg-success' },
  late: { label: 'Late', colorClass: 'bg-warning' },
  absent: { label: 'Absent', colorClass: 'bg-destructive' },
  leave: { label: 'Leave', colorClass: 'bg-info' },
}

export function AttendanceOverviewChart({ rows }: AttendanceOverviewChartProps) {
  const total = rows.reduce((sum, row) => sum + row.count, 0)

  if (total === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        message="Attendance overview"
        hint="No attendance has been marked across any school in the last 30 days yet."
      />
    )
  }

  const countByStatus = new Map(rows.map((row) => [row.status, row.count]))
  const max = Math.max(...rows.map((row) => row.count), 1)

  return (
    <div className="rounded-xl bg-card p-4 shadow-md">
      <h3 className="text-sm font-extrabold text-foreground">Attendance overview</h3>
      <p className="mt-0.5 text-[13px] text-muted-foreground">
        Every attendance mark across every school, last 30 days
      </p>
      <div className="mt-5 flex items-end gap-2">
        {STATUS_ORDER.map((status) => {
          const count = countByStatus.get(status) ?? 0
          const { label, colorClass } = STATUS_META[status]

          return (
            <div key={status} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="tabular text-xs font-bold text-foreground">{count}</span>
              <div className="flex h-32 w-full items-end justify-center">
                <div
                  className={`w-6 rounded-t-[4px] ${colorClass}`}
                  style={{ height: `${String(Math.max((count / max) * 100, count > 0 ? 6 : 0))}%` }}
                  title={`${label}: ${String(count)}`}
                />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
