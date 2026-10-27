import { AlertCircle, Check, Clock, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const TONE_CLASS: Record<StatusTone, string> = {
  success: 'bg-success-bg text-success-text',
  warning: 'bg-warning-bg text-warning-text',
  danger: 'bg-destructive-bg text-destructive-text',
  info: 'bg-info-bg text-info-text',
  neutral: 'bg-accent text-muted-foreground',
}

const TONE_ICON = {
  success: Check,
  warning: Clock,
  danger: X,
  info: Info,
  neutral: AlertCircle,
} as const

interface StatusBadgeProps {
  tone: StatusTone
  label: string
  className?: string | undefined
}

export function StatusBadge({ tone, label, className }: StatusBadgeProps) {
  const Icon = TONE_ICON[tone]

  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full pr-[11px] pl-[9px] text-[13px] font-bold whitespace-nowrap',
        TONE_CLASS[tone],
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0 stroke-[2.5]" aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}
