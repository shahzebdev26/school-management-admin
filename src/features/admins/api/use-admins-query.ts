'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient, unwrap } from '@/lib/api/client'
import type { paths } from '@/lib/api/generated/schema'
import { adminKeys } from './admin-keys'

type AdminsParams = paths['/v1/platform-admins']['get']['parameters']['query']

export type AdminListItem =
  paths['/v1/platform-admins']['get']['responses'][200]['content']['application/json']['data'][number]

export function useAdminsQuery(params: AdminsParams) {
  return useQuery({
    queryKey: adminKeys.list(params),
    queryFn: async () => {
      const result = await unwrap(
        apiClient.GET('/v1/platform-admins', { params: { query: params ?? {} } }),
      )
      return result
    },
  })
}
