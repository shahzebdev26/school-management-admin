'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient, unwrap } from '@/lib/api/client'
import { ApiError } from '@/lib/api/errors'
import type { paths } from '@/lib/api/generated/schema'
import { authKeys } from './auth-keys'

export type Session =
  paths['/v1/auth/me']['get']['responses'][200]['content']['application/json']['data']

const UNAUTHENTICATED_STATUSES = new Set([401, 403])

export function useSessionQuery() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: async () => {
      try {
        const result = await unwrap(apiClient.GET('/v1/auth/me'))
        return result.data
      } catch (error) {
        if (error instanceof ApiError && UNAUTHENTICATED_STATUSES.has(error.status)) {
          return null
        }
        throw error
      }
    },
    retry: false,
  })
}
