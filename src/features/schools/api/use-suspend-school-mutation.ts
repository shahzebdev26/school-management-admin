'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, unwrap } from '@/lib/api/client'
import { schoolKeys } from './school-keys'

export function useSuspendSchoolMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await unwrap(
        apiClient.POST('/v1/schools/{id}/suspend', { params: { path: { id } } }),
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: schoolKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: schoolKeys.lists() })
    },
  })
}
