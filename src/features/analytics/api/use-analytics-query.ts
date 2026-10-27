'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient, unwrap } from '@/lib/api/client'

export function useAnalyticsQuery() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const result = await unwrap(apiClient.GET('/v1/analytics'))
      return result.data
    },
  })
}
