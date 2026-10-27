'use client'

import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getEnv } from '@/lib/env'
import { useIssueTicketMutation } from '../api/use-issue-ticket-mutation'

interface ViewAsTriggerProps {
  schoolId: string
}

export function ViewAsTrigger({ schoolId }: ViewAsTriggerProps) {
  const mutation = useIssueTicketMutation()

  const handleClick = () => {
    mutation.mutate(
      { schoolId },
      {
        onSuccess: ({ ticket, schoolSlug }) => {
          window.location.href = `https://${schoolSlug}.${getEnv().NEXT_PUBLIC_APP_DOMAIN}/view-as?ticket=${ticket}`
        },
      },
    )
  }

  return (
    <Button variant="outline" size="sm" disabled={mutation.isPending} onClick={handleClick}>
      <ExternalLink className="size-4" aria-hidden="true" />
      {mutation.isPending ? 'Preparing…' : 'View as this school'}
    </Button>
  )
}
