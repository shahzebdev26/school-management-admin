import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { DataTableColumn } from './data-table.types'

interface DataTableProps<TRow> {
  rows: TRow[]
  columns: DataTableColumn<TRow>[]
  getRowId: (row: TRow) => string
  caption: string
  onRowClick?: (row: TRow) => void
}

const PINNED = 'sticky left-0 border-r border-border bg-card'

function DataTableHead<TRow>({ columns }: { columns: DataTableColumn<TRow>[] }) {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        {columns.map((column, index) => (
          <TableHead
            key={column.id}
            scope="col"
            className={cn(
              column.numeric && 'text-right',
              column.pinned && index === 0 && cn(PINNED, 'z-20'),
              column.widthClass,
            )}
          >
            {column.header}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  )
}

function cellClasses<TRow>(column: DataTableColumn<TRow>, isFirst: boolean): string {
  return cn(
    'text-sm',
    column.numeric && 'tabular text-right',
    column.pinned && isFirst && cn(PINNED, 'z-10 font-bold'),
    column.widthClass,
  )
}

export function DataTable<TRow>({
  rows,
  columns,
  getRowId,
  caption,
  onRowClick,
}: DataTableProps<TRow>) {
  const isInteractive = onRowClick !== undefined

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-md">
      <Table>
        <TableCaption className="sr-only">{caption}</TableCaption>
        <DataTableHead columns={columns} />
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={getRowId(row)}
              onClick={
                isInteractive
                  ? () => {
                      onRowClick(row)
                    }
                  : undefined
              }
              className={isInteractive ? 'h-14 cursor-pointer' : 'h-13'}
              tabIndex={isInteractive ? 0 : undefined}
            >
              {columns.map((column, index) => (
                <TableCell key={column.id} className={cellClasses(column, index === 0)}>
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
