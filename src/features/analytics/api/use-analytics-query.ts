'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient, unwrap } from '@/lib/api/client'
import type { paths } from '@/lib/api/generated/schema'

export type AnalyticsOverview =
  paths['/v1/analytics']['get']['responses'][200]['content']['application/json']['data']

export type AttendanceStatusCount = AnalyticsOverview['attendanceOverview'][number]
export type AttendanceStatus = AttendanceStatusCount['status']

export function useAnalyticsQuery() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const result = await unwrap(apiClient.GET('/v1/analytics'))
      return result.data
    },
  })
}
