'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, unwrap } from '@/lib/api/client'
import { schoolKeys } from './school-keys'

interface UpdateSchoolInput {
  name?: string
  contactPerson?: string
  phone?: string
  address?: string
  features?: Partial<Record<string, boolean>>
}

export function useUpdateSchoolMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateSchoolInput) => {
      const result = await unwrap(
        apiClient.PATCH('/v1/schools/{id}', { params: { path: { id } }, body: input }),
      )
      return result.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: schoolKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: schoolKeys.lists() })
    },
  })
}
