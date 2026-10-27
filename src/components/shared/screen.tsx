import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ScreenProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function Screen({ title, description, actions, children, className }: ScreenProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:px-8',
        className,
      )}
    >
      <header className="flex min-w-0 flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] leading-tight font-extrabold tracking-[-0.03em] text-foreground sm:text-[32px]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 text-sm font-medium text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2.5">{actions}</div> : null}
      </header>
      {children}
    </div>
  )
}
