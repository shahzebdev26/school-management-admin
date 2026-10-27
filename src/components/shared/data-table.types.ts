import type { ReactNode } from 'react'

export interface DataTableColumn<TRow> {
  id: string
  header: string
  cell: (row: TRow) => ReactNode
  numeric?: boolean
  pinned?: boolean
  widthClass?: string
}
