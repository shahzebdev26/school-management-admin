'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, unwrap } from '@/lib/api/client'
import { adminKeys } from './admin-keys'

export function useDeactivateAdminMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await unwrap(
        apiClient.POST('/v1/platform-admins/{id}/deactivate', { params: { path: { id } } }),
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.lists() })
    },
  })
}
