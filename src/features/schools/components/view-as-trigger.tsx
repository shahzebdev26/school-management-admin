'use client'

import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { schoolWebOrigin } from '@/lib/env.public'
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
          // This is a different Next.js app on its own origin (the school's own
          // subdomain), not an internal route — next/navigation's router cannot
          // reach it, so a full navigation is correct here.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = `${schoolWebOrigin(schoolSlug)}/view-as?ticket=${ticket}`
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
