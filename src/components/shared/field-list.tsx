import type { ReactNode } from 'react'

export interface FieldListItem {
  label: string
  value: ReactNode
  numeric?: boolean
}

interface FieldListProps {
  items: FieldListItem[]
}

export function FieldList({ items }: FieldListProps) {
  return (
    <dl className="rounded-xl bg-card px-5 py-1.5 shadow-md">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-baseline justify-between gap-6 border-b border-border py-3 text-sm last:border-b-0"
        >
          <dt className="shrink-0 font-semibold text-muted-foreground">{item.label}</dt>
          <dd
            className={
              item.numeric
                ? 'tabular text-right font-bold text-foreground'
                : 'text-right font-bold text-foreground'
            }
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
