'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient, unwrap } from '@/lib/api/client'
import type { paths } from '@/lib/api/generated/schema'
import { auditKeys } from './audit-keys'

type AuditParams = paths['/v1/audit-logs']['get']['parameters']['query']

export type AuditLogEntry =
  paths['/v1/audit-logs']['get']['responses'][200]['content']['application/json']['data'][number]

export function useAuditLogsQuery(params: AuditParams) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: async () => {
      const result = await unwrap(
        apiClient.GET('/v1/audit-logs', { params: { query: params ?? {} } }),
      )
      return result
    },
  })
}
