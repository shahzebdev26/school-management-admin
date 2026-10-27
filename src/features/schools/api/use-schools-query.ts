'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient, unwrap } from '@/lib/api/client'
import type { paths } from '@/lib/api/generated/schema'
import { schoolKeys } from './school-keys'

type SchoolsParams = paths['/v1/schools']['get']['parameters']['query']

export type SchoolListItem =
  paths['/v1/schools']['get']['responses'][200]['content']['application/json']['data'][number]

export function useSchoolsQuery(params: SchoolsParams) {
  return useQuery({
    queryKey: schoolKeys.list(params),
    queryFn: async () => {
      const result = await unwrap(apiClient.GET('/v1/schools', { params: { query: params ?? {} } }))
      return result
    },
  })
}
