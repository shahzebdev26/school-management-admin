'use client'

import type { ReactNode } from 'react'
import { useAuthenticatedSession } from '@/features/auth/hooks/use-authenticated-session'
import { AppShell } from './app-shell'
import { AppShellSkeleton } from './app-shell-skeleton'

interface AuthenticatedShellProps {
  children: ReactNode
}

export function AuthenticatedShell({ children }: AuthenticatedShellProps) {
  const { session, isPending } = useAuthenticatedSession()

  if (isPending || !session) {
    return <AppShellSkeleton />
  }

  return <AppShell session={session}>{children}</AppShell>
}
