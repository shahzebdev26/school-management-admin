'use client'

import { Building, LayoutDashboard, LogOut, Menu, ScrollText, Shield } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { Session } from '@/features/auth/api/use-session-query'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/schools', label: 'Schools', icon: Building },
  { href: '/dashboard/admins', label: 'Admins', icon: Shield },
  { href: '/dashboard/audit', label: 'Audit Log', icon: ScrollText },
] as const

interface AppShellProps {
  session: Session
  children: ReactNode
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: (() => void) | undefined
}) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            {...(onNavigate ? { onClick: onNavigate } : {})}
            className={cn(
              'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-bold transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <Icon className="size-[18px] shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex h-full flex-col gap-6 px-4 py-5">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LayoutDashboard className="size-4" />
        </span>
        <span className="text-base font-extrabold tracking-tight text-foreground">TechSparks</span>
      </Link>
      <NavLinks pathname={pathname} />
    </div>
  )
}

export function AppShell({ session, children }: AppShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const displayName = session.name

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarContent pathname={pathname} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="lg:hidden">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" showCloseButton={false} className="w-60 p-0">
                <SidebarContent pathname={pathname} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-foreground">{displayName}</span>
            <form action="/api/auth/logout" method="POST">
              <Button variant="ghost" size="icon-sm" type="submit">
                <LogOut className="size-[18px]" />
                <span className="sr-only">Sign out</span>
              </Button>
            </form>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
