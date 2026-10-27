'use client'

import { BarChart3, Building2, Shield, TrendingUp } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { Screen } from '@/components/shared/screen'
import { StatTile } from '@/components/shared/stat-tile'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnalyticsQuery } from '../api/use-analytics-query'

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  )
}

export function AnalyticsDashboard() {
  const query = useAnalyticsQuery()

  if (query.isPending) {
    return (
      <Screen title="Dashboard">
        <StatsSkeleton />
      </Screen>
    )
  }

  if (query.isError) {
    return (
      <Screen title="Dashboard">
        <ErrorState
          onRetry={() => {
            void query.refetch()
          }}
        />
      </Screen>
    )
  }

  const { schoolsByStatus, totalAdmins } = query.data

  return (
    <Screen title="Dashboard" description="Platform overview">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Trial Schools" value={String(schoolsByStatus.trial)} icon={Building2} />
        <StatTile label="Active Schools" value={String(schoolsByStatus.active)} icon={Building2} />
        <StatTile label="Suspended Schools" value={String(schoolsByStatus.suspended)} icon={Building2} />
        <StatTile label="Total Admins" value={String(totalAdmins)} icon={Shield} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <EmptyState icon={TrendingUp} message="Enrolment Trends" hint="Coming soon" />
        <EmptyState icon={BarChart3} message="Attendance Overview" hint="Coming soon" />
      </div>
    </Screen>
  )
}
