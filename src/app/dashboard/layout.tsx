import type { ReactNode } from 'react'
import { AuthenticatedShell } from '@/components/layout/authenticated-shell'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <AuthenticatedShell>{children}</AuthenticatedShell>
}
