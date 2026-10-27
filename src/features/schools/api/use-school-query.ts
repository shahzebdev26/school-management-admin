'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient, unwrap } from '@/lib/api/client'
import type { paths } from '@/lib/api/generated/schema'
import { schoolKeys } from './school-keys'

export type School =
  paths['/v1/schools/{id}']['get']['responses'][200]['content']['application/json']['data']

export function useSchoolQuery(id: string) {
  return useQuery({
    queryKey: schoolKeys.detail(id),
    queryFn: async () => {
      const result = await unwrap(apiClient.GET('/v1/schools/{id}', { params: { path: { id } } }))
      return result.data
    },
    enabled: id.length > 0,
  })
}
