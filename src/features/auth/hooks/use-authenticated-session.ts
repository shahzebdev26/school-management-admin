'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSessionQuery, type Session } from '../api/use-session-query'

interface AuthenticatedSessionResult {
  session: Session | undefined
  isPending: boolean
}

export function useAuthenticatedSession(): AuthenticatedSessionResult {
  const router = useRouter()
  const { data: session, isPending } = useSessionQuery()

  useEffect(() => {
    if (session === null) {
      router.replace('/login')
    }
  }, [session, router])

  return { session: session ?? undefined, isPending: isPending || session === null }
}
