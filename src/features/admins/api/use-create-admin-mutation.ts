'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, unwrap } from '@/lib/api/client'
import { adminKeys } from './admin-keys'

interface CreateAdminInput {
  name: string
  email: string
  password: string
}

export function useCreateAdminMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateAdminInput) => {
      const result = await unwrap(apiClient.POST('/v1/platform-admins', { body: input }))
      return result.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.lists() })
    },
  })
}
