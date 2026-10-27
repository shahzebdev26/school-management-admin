import { AlertTriangle, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  variant?: 'error' | 'offline'
  message?: string
  onRetry?: () => void
}

const COPY = {
  error: {
    icon: AlertTriangle,
    message: 'Something went wrong loading this.',
    hint: 'This is not a change to your records.',
  },
  offline: {
    icon: WifiOff,
    message: "You're offline.",
    hint: 'Connect to the internet to continue.',
  },
} as const

export function ErrorState({ variant = 'error', message, onRetry }: ErrorStateProps) {
  const copy = COPY[variant]
  const Icon = copy.icon
  const isOffline = variant === 'offline'

  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-xl bg-card px-6 py-9 text-center shadow-md"
    >
      <span
        className={cn(
          'mb-3 flex size-[52px] items-center justify-center rounded-2xl',
          isOffline ? 'bg-warning-bg text-warning-text' : 'bg-destructive-bg text-destructive-text',
        )}
      >
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <p className="text-base font-extrabold text-foreground">{message ?? copy.message}</p>
      <p className="mt-1 max-w-[30ch] text-[13px] text-muted-foreground">{copy.hint}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          Try again
        </Button>
      ) : null}
    </div>
  )
}
