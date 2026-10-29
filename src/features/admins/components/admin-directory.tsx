'use client'

import { Plus, Shield } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable } from '@/components/shared/data-table'
import { DataTableSkeleton } from '@/components/shared/data-table-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { Pagination } from '@/components/shared/pagination'
import { Screen } from '@/components/shared/screen'
import { StatusBadge, type StatusTone } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import type { DataTableColumn } from '@/components/shared/data-table.types'
import { ApiError } from '@/lib/api/errors'
import { useAuthenticatedSession } from '@/features/auth/hooks/use-authenticated-session'
import { useActivateAdminMutation } from '../api/use-activate-admin-mutation'
import { useAdminsQuery, type AdminListItem } from '../api/use-admins-query'
import { useDeactivateAdminMutation } from '../api/use-deactivate-admin-mutation'

const PAGE_SIZE = 20

// Must match the API's PLATFORM_ADMIN_STATUSES exactly ('active' | 'inactive')
// — the schema is now a real enum precisely so this can't silently drift again.
const STATUS_TONE: Record<string, StatusTone> = {
  active: 'success',
  inactive: 'danger',
}

function reportError(error: unknown, fallback: string) {
  toast.error(error instanceof ApiError ? error.message : fallback)
}

function DeactivateAction({ admin }: { admin: AdminListItem }) {
  const mutation = useDeactivateAdminMutation()

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="destructive"
          size="xs"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          Deactivate
        </Button>
      }
      title={`Deactivate ${admin.name}?`}
      description="This admin will no longer be able to sign in to the platform."
      confirmLabel="Deactivate"
      onConfirm={() => {
        mutation.mutate(admin.id, {
          onSuccess: () => {
            toast.success(`${admin.name} deactivated`)
          },
          onError: (error) => {
            reportError(error, 'Could not deactivate this admin')
          },
        })
      }}
      isPending={mutation.isPending}
    />
  )
}

function ActivateAction({ admin }: { admin: AdminListItem }) {
  const mutation = useActivateAdminMutation()

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="outline"
          size="xs"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          Activate
        </Button>
      }
      tone="default"
      title={`Activate ${admin.name}?`}
      description="This admin will be able to sign in to the platform again."
      confirmLabel="Activate"
      onConfirm={() => {
        mutation.mutate(admin.id, {
          onSuccess: () => {
            toast.success(`${admin.name} activated`)
          },
          onError: (error) => {
            reportError(error, 'Could not activate this admin')
          },
        })
      }}
      isPending={mutation.isPending}
    />
  )
}

function AdminStatusAction({
  admin,
  currentAdminId,
}: {
  admin: AdminListItem
  currentAdminId: string
}) {
  if (admin.id === currentAdminId) return null

  return admin.status === 'active' ? (
    <DeactivateAction admin={admin} />
  ) : (
    <ActivateAction admin={admin} />
  )
}

function useAdminColumns(sessionId: string | null): DataTableColumn<AdminListItem>[] {
  return [
    { id: 'name', header: 'Name', cell: (row) => row.name },
    { id: 'email', header: 'Email', cell: (row) => row.email },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge tone={STATUS_TONE[row.status] ?? 'neutral'} label={row.status} />,
    },
    {
      id: 'lastLogin',
      header: 'Last Login',
      cell: (row) => (row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString() : 'Never'),
    },
    {
      id: 'actions',
      header: '',
      cell: (row) =>
        sessionId ? <AdminStatusAction admin={row} currentAdminId={sessionId} /> : null,
    },
  ]
}

function AdminDirectoryContent({
  query,
  columns,
  page,
  onPageChange,
}: {
  query: ReturnType<typeof useAdminsQuery>
  columns: DataTableColumn<AdminListItem>[]
  page: number
  onPageChange: (p: number) => void
}) {
  if (query.isPending) return <DataTableSkeleton columnCount={5} rowCount={PAGE_SIZE} />
  if (query.isError) {
    return (
      <ErrorState
        onRetry={() => {
          void query.refetch()
        }}
      />
    )
  }
  if (query.data.data.length === 0) {
    return <EmptyState icon={Shield} message="No admins found" />
  }
  return (
    <>
      <DataTable
        rows={query.data.data}
        columns={columns}
        getRowId={(row) => row.id}
        caption="Platform administrators"
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

export function AdminDirectory() {
  const { session } = useAuthenticatedSession()
  const [page, setPage] = useState(1)
  const query = useAdminsQuery({ page, limit: PAGE_SIZE })
  const columns = useAdminColumns(session?.id ?? null)

  return (
    <Screen
      title="Admins"
      description="Manage platform administrators"
      actions={
        <Button asChild className="h-[52px]">
          <Link href="/dashboard/admins/create">
            <Plus aria-hidden="true" />
            Add admin
          </Link>
        </Button>
      }
    >
      <AdminDirectoryContent query={query} columns={columns} page={page} onPageChange={setPage} />
    </Screen>
  )
}
