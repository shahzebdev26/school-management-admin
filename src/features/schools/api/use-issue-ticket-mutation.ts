'use client'

import { useMutation } from '@tanstack/react-query'
import { apiClient, unwrap } from '@/lib/api/client'

interface IssueTicketInput {
  schoolId: string
}

export function useIssueTicketMutation() {
  return useMutation({
    mutationFn: async (input: IssueTicketInput) => {
      const result = await unwrap(apiClient.POST('/v1/view-as-tickets', { body: input }))
      return result.data
    },
  })
}
