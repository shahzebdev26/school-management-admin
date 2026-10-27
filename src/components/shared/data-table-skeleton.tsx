import { Skeleton } from '@/components/ui/skeleton'

interface DataTableSkeletonProps {
  columnCount: number
  rowCount: number
}

export function DataTableSkeleton({ columnCount, rowCount }: DataTableSkeletonProps) {
  const columns = Array.from({ length: columnCount }, (_, index) => index)
  const rows = Array.from({ length: rowCount }, (_, index) => index)

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-md" aria-hidden="true">
      <div className="flex h-12 items-center gap-4 border-b-[1.5px] border-border px-3">
        {columns.map((column) => (
          <Skeleton key={column} className="h-3.5 flex-1" />
        ))}
      </div>
      {rows.map((row) => (
        <div
          key={row}
          className="flex h-13 items-center gap-4 border-b border-border px-3 last:border-b-0"
        >
          {columns.map((column) => (
            <Skeleton key={column} className="h-[18px] flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
