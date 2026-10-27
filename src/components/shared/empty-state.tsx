import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  message: string
  hint?: string
  icon?: LucideIcon
  action?: ReactNode
}

export function EmptyState({ message, hint, icon: Icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-card px-6 py-9 text-center shadow-md">
      {Icon ? (
        <span className="mb-3 flex size-[52px] items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      ) : null}
      <p className="text-base font-extrabold text-foreground">{message}</p>
      {hint ? <p className="mt-1 max-w-[30ch] text-[13px] text-muted-foreground">{hint}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
