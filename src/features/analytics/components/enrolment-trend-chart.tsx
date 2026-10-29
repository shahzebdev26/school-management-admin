import { TrendingUp } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import type { AnalyticsOverview } from '../api/use-analytics-query'

interface EnrolmentTrendChartProps {
  points: AnalyticsOverview['enrolmentTrend']
}

function formatMonthLabel(month: string): string {
  const [year, monthIndex] = month.split('-')

  if (!year || !monthIndex) {
    return month
  }

  const date = new Date(Number(year), Number(monthIndex) - 1, 1)
  return new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date)
}

export function EnrolmentTrendChart({ points }: EnrolmentTrendChartProps) {
  if (points.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        message="Enrolment trend"
        hint="No admissions across any school in the last 6 months yet."
      />
    )
  }

  const max = Math.max(...points.map((point) => point.count), 1)

  return (
    <div className="rounded-xl bg-card p-4 shadow-md">
      <h3 className="text-sm font-extrabold text-foreground">Enrolment trend</h3>
      <p className="mt-0.5 text-[13px] text-muted-foreground">
        New admissions across every school, last 6 months
      </p>
      <div className="mt-5 flex items-end gap-2">
        {points.map((point) => (
          <div key={point.month} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="tabular text-xs font-bold text-foreground">{point.count}</span>
            <div className="flex h-32 w-full items-end justify-center">
              <div
                className="w-6 rounded-t-[4px] bg-chart-1"
                style={{
                  height: `${String(Math.max((point.count / max) * 100, point.count > 0 ? 6 : 0))}%`,
                }}
                title={`${formatMonthLabel(point.month)}: ${String(point.count)} admitted`}
              />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">
              {formatMonthLabel(point.month)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
