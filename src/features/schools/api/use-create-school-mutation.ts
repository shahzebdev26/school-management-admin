'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, unwrap } from '@/lib/api/client'
import type { paths } from '@/lib/api/generated/schema'
import { schoolKeys } from './school-keys'

type CreateSchoolBody =
  paths['/v1/schools']['post']['requestBody']['content']['application/json']

export type CreateSchoolResult =
  paths['/v1/schools']['post']['responses'][201]['content']['application/json']['data']

export function useCreateSchoolMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateSchoolBody) => {
      return unwrap(apiClient.POST('/v1/schools', { body: input }))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: schoolKeys.lists() })
    },
  })
}
