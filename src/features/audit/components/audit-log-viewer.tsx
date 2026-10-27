'use client'

import { ScrollText } from 'lucide-react'
import { useState } from 'react'
import { DataTable } from '@/components/shared/data-table'
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { Pagination } from '@/components/shared/pagination'
import { Screen } from '@/components/shared/screen'
import { SearchInput } from '@/components/shared/search-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DataTableColumn } from '@/components/shared/data-table.types'
import { useAuditLogsQuery, type AuditLogEntry } from '../api/use-audit-logs-query'

const PAGE_SIZE = 30

const COLUMNS: DataTableColumn<AuditLogEntry>[] = [
  {
    id: 'timestamp',
    header: 'Timestamp',
    cell: (row) => new Date(row.createdAt).toLocaleString(),
  },
  { id: 'actor', header: 'Actor', cell: (row) => row.actorUserId ?? '-' },
  { id: 'actingAs', header: 'Acting As', cell: (row) => row.actingAsUserId ?? '-' },
  { id: 'action', header: 'Action', cell: (row) => row.action },
  { id: 'entityType', header: 'Entity Type', cell: (row) => row.entityType },
  {
    id: 'entityId',
    header: 'Entity ID',
    cell: (row) => (
      <span className="text-xs font-bold text-muted-foreground">{row.entityId ?? '-'}</span>
    ),
  },
  { id: 'school', header: 'School', cell: (row) => row.schoolId ?? '-' },
]

function AuditFilters({
  search,
  onSearchChange,
  action,
  onActionChange,
  entityType,
  onEntityTypeChange,
}: {
  search: string
  onSearchChange: (v: string) => void
  action: string
  onActionChange: (v: string) => void
  entityType: string
  onEntityTypeChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-full sm:max-w-xs">
        <SearchInput value={search} onValueChange={onSearchChange} label="Search audit logs" />
      </div>
      <Select value={action} onValueChange={onActionChange}>
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All actions</SelectItem>
          <SelectItem value="create">Create</SelectItem>
          <SelectItem value="update">Update</SelectItem>
          <SelectItem value="delete">Delete</SelectItem>
          <SelectItem value="login">Login</SelectItem>
          <SelectItem value="logout">Logout</SelectItem>
        </SelectContent>
      </Select>
      <Select value={entityType} onValueChange={onEntityTypeChange}>
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All entities</SelectItem>
          <SelectItem value="school">School</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">User</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

function AuditContent({
  query,
  page,
  onPageChange,
}: {
  query: ReturnType<typeof useAuditLogsQuery>
  page: number
  onPageChange: (p: number) => void
}) {
  if (query.isPending) return <DataTableSkeleton columnCount={7} rowCount={PAGE_SIZE} />
  if (query.isError)
    return (
      <ErrorState
        onRetry={() => {
          void query.refetch()
        }}
      />
    )
  if (query.data.data.length === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        message="No audit logs found"
        hint="Activity will appear here"
      />
    )
  }
  return (
    <>
      <DataTable
        rows={query.data.data}
        columns={COLUMNS}
        getRowId={(row) => row.id}
        caption="Audit log entries"
      />
      <Pagination
        page={page}
        limit={PAGE_SIZE}
        total={query.data.meta.total}
        onPageChange={onPageChange}
      />
    </>
  )
}

export function AuditLogViewer() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('all')
  const [entityType, setEntityType] = useState('all')

  const query = useAuditLogsQuery({
    page,
    limit: PAGE_SIZE,
    ...(search.length > 0 ? { search } : {}),
    ...(action !== 'all' ? { action } : {}),
    ...(entityType !== 'all' ? { entityType } : {}),
  })

  const resetPage = (setter: (v: string) => void) => (v: string) => {
    setter(v)
    setPage(1)
  }

  return (
    <Screen title="Audit Log" description="Platform activity history">
      <AuditFilters
        search={search}
        onSearchChange={resetPage(setSearch)}
        action={action}
        onActionChange={resetPage(setAction)}
        entityType={entityType}
        onEntityTypeChange={resetPage(setEntityType)}
      />
      <AuditContent query={query} page={page} onPageChange={setPage} />
    </Screen>
  )
}
