'use client'

import { Building2, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DataTable } from '@/components/shared/data-table'
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { Pagination } from '@/components/shared/pagination'
import { Screen } from '@/components/shared/screen'
import { SearchInput } from '@/components/shared/search-input'
import { StatusBadge, type StatusTone } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DataTableColumn } from '@/components/shared/data-table.types'
import { useSchoolsQuery, type SchoolListItem } from '../api/use-schools-query'

const PAGE_SIZE = 20

function narrowStatus(v: string): 'trial' | 'active' | 'suspended' | undefined {
  if (v === 'trial' || v === 'active' || v === 'suspended') return v
  return undefined
}

function narrowType(v: string): 'school' | 'coaching' | 'tuition' | undefined {
  if (v === 'school' || v === 'coaching' || v === 'tuition') return v
  return undefined
}

const STATUS_TONE: Record<string, StatusTone> = {
  active: 'success',
  suspended: 'danger',
  trial: 'info',
}

const COLUMNS: DataTableColumn<SchoolListItem>[] = [
  { id: 'name', header: 'Name', cell: (row) => row.name },
  {
    id: 'slug',
    header: 'Subdomain',
    cell: (row) => <span className="text-xs font-bold text-muted-foreground">{row.slug}</span>,
  },
  {
    id: 'type',
    header: 'Type',
    cell: (row) => <Badge variant="secondary">{row.type}</Badge>,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge tone={STATUS_TONE[row.status] ?? 'neutral'} label={row.status} />,
  },
  { id: 'contact', header: 'Contact', cell: (row) => row.contactPerson },
  {
    id: 'created',
    header: 'Created',
    cell: (row) => new Date(row.createdAt).toLocaleDateString(),
  },
]

function SchoolFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  type,
  onTypeChange,
}: {
  search: string
  onSearchChange: (v: string) => void
  status: string
  onStatusChange: (v: string) => void
  type: string
  onTypeChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-full sm:max-w-xs">
        <SearchInput value={search} onValueChange={onSearchChange} label="Search schools" />
      </div>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
          <SelectItem value="trial">Trial</SelectItem>
        </SelectContent>
      </Select>
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger className="bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="school">School</SelectItem>
          <SelectItem value="coaching">Coaching</SelectItem>
          <SelectItem value="tuition">Tuition</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

function SchoolContent({
  query,
  page,
  onPageChange,
  onRowClick,
}: {
  query: ReturnType<typeof useSchoolsQuery>
  page: number
  onPageChange: (p: number) => void
  onRowClick: (row: SchoolListItem) => void
}) {
  if (query.isPending) return <DataTableSkeleton columnCount={6} rowCount={PAGE_SIZE} />
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
        icon={Building2}
        message="No schools found"
        hint="Add a school to get started"
        action={
          <Button asChild size="sm">
            <Link href="/dashboard/schools/create">Add school</Link>
          </Button>
        }
      />
    )
  }
  return (
    <>
      <DataTable
        rows={query.data.data}
        columns={COLUMNS}
        getRowId={(row) => row.id}
        caption="Schools directory"
        onRowClick={onRowClick}
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

export function SchoolDirectory() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')

  const narrowedStatus = narrowStatus(status)
  const narrowedType = narrowType(type)

  const query = useSchoolsQuery({
    page,
    limit: PAGE_SIZE,
    ...(search.length > 0 ? { search } : {}),
    ...(narrowedStatus ? { status: narrowedStatus } : {}),
    ...(narrowedType ? { type: narrowedType } : {}),
  })

  const resetPage = (setter: (v: string) => void) => (v: string) => {
    setter(v)
    setPage(1)
  }

  return (
    <Screen
      title="Schools"
      description="Manage registered schools on the platform"
      actions={
        <Button asChild className="h-[52px]">
          <Link href="/dashboard/schools/create">
            <Plus aria-hidden="true" />
            Add school
          </Link>
        </Button>
      }
    >
      <SchoolFilters
        search={search}
        onSearchChange={resetPage(setSearch)}
        status={status}
        onStatusChange={resetPage(setStatus)}
        type={type}
        onTypeChange={resetPage(setType)}
      />
      <SchoolContent
        query={query}
        page={page}
        onPageChange={setPage}
        onRowClick={(row) => {
          router.push(`/dashboard/schools/${row.id}`)
        }}
      />
    </Screen>
  )
}
