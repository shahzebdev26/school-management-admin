'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, unwrap } from '@/lib/api/client'
import type { LoginInput } from '../schemas/login-schema'
import { authKeys } from './auth-keys'

export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const result = await unwrap(apiClient.POST('/v1/auth/login', { body: input }))
      return result.data
    },
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.session, session)
    },
  })
}
