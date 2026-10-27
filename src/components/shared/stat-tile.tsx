import { ArrowDown, ArrowUp, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatTileProps {
  label: string
  value: string
  detail?: string
  icon?: LucideIcon
  trend?: { value: string; positive?: boolean }
  className?: string
}

export function StatTile({ label, value, detail, icon: Icon, trend, className }: StatTileProps) {
  const TrendIcon = trend?.positive ? ArrowUp : ArrowDown

  return (
    <div className={cn('min-w-0 rounded-xl bg-card p-4 shadow-md', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-bold text-muted-foreground">{label}</span>
        {Icon ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-accent text-accent-foreground">
            <Icon className="size-[18px]" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <p className="tabular mt-2 text-4xl leading-[1.1] font-extrabold tracking-[-0.02em] text-foreground">
        {value}
      </p>
      {detail ? <p className="mt-0.5 text-[13px] text-muted-foreground">{detail}</p> : null}

      {trend ? (
        <p
          className={cn(
            'mt-1.5 inline-flex items-center gap-1 text-xs font-extrabold',
            trend.positive ? 'text-success-text' : 'text-destructive-text',
          )}
        >
          <TrendIcon className="size-3.5" aria-hidden="true" />
          {trend.value}
        </p>
      ) : null}
    </div>
  )
}
