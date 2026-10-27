'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { PhoneField } from '@/components/form/phone-field'
import { TextField } from '@/components/form/text-field'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ErrorState } from '@/components/shared/error-state'
import { Screen } from '@/components/shared/screen'
import { StatusBadge, type StatusTone } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useSchoolQuery } from '../api/use-school-query'
import { useUpdateSchoolMutation } from '../api/use-update-school-mutation'
import { useSuspendSchoolMutation } from '../api/use-suspend-school-mutation'
import { useActivateSchoolMutation } from '../api/use-activate-school-mutation'
import { updateSchoolSchema, type UpdateSchoolFormValues, type UpdateSchoolInput } from '../schemas/update-school-schema'
import { ViewAsTrigger } from './view-as-trigger'

const STATUS_TONE: Record<string, StatusTone> = {
  active: 'success',
  suspended: 'danger',
  trial: 'info',
}

type SchoolData = NonNullable<ReturnType<typeof useSchoolQuery>['data']>

function SchoolInfoDisplay({ school }: { school: SchoolData }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
      <dt className="font-bold text-muted-foreground">Name</dt>
      <dd>{school.name}</dd>
      <dt className="font-bold text-muted-foreground">Slug</dt>
      <dd>{school.slug}</dd>
      <dt className="font-bold text-muted-foreground">Type</dt>
      <dd>{school.type}</dd>
      <dt className="font-bold text-muted-foreground">Contact</dt>
      <dd>{school.contactPerson}</dd>
      <dt className="font-bold text-muted-foreground">Phone</dt>
      <dd>{school.phone}</dd>
      <dt className="font-bold text-muted-foreground">Address</dt>
      <dd>{school.address}</dd>
    </dl>
  )
}

function SchoolEditForm({
  id,
  school,
  onDone,
}: {
  id: string
  school: SchoolData
  onDone: () => void
}) {
  const updateMutation = useUpdateSchoolMutation(id)
  const form = useForm<UpdateSchoolFormValues, unknown, UpdateSchoolInput>({
    resolver: zodResolver(updateSchoolSchema),
    values: {
      name: school.name,
      contactPerson: school.contactPerson ?? '',
      phone: school.phone ?? '',
      address: school.address ?? '',
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    updateMutation.mutate(values, {
      onSuccess: () => { toast.success('School updated'); onDone() },
    })
  })

  return (
    <form onSubmit={(e) => { void onSubmit(e) }} className="flex flex-col gap-4">
      <TextField control={form.control} name="name" label="Name" required />
      <TextField control={form.control} name="contactPerson" label="Contact person" required />
      <PhoneField control={form.control} name="phone" required />
      <TextField control={form.control} name="address" label="Address" required />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => { onDone(); form.reset() }}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function SchoolStatusSection({ school, id }: { school: SchoolData; id: string }) {
  const suspendMutation = useSuspendSchoolMutation(id)
  const activateMutation = useActivateSchoolMutation(id)

  return (
    <section className="flex max-w-lg flex-col gap-4 rounded-xl bg-card p-6 shadow-md">
      <h2 className="text-lg font-extrabold text-foreground">Status</h2>
      <div className="flex items-center gap-4">
        <StatusBadge tone={STATUS_TONE[school.status] ?? 'neutral'} label={school.status} />
        {school.status === 'active' || school.status === 'trial' ? (
          <ConfirmDialog
            trigger={<Button variant="destructive" size="sm">Suspend</Button>}
            title={`Suspend ${school.name}?`}
            description="This school will lose access to the platform until reactivated."
            confirmLabel="Suspend"
            onConfirm={() => { suspendMutation.mutate(undefined, { onSuccess: () => { toast.success('School suspended') } }) }}
            isPending={suspendMutation.isPending}
          />
        ) : null}
        {school.status === 'suspended' ? (
          <ConfirmDialog
            trigger={<Button size="sm">Activate</Button>}
            title={`Activate ${school.name}?`}
            description="This school will regain access to the platform."
            confirmLabel="Activate"
            tone="default"
            onConfirm={() => { activateMutation.mutate(undefined, { onSuccess: () => { toast.success('School activated') } }) }}
            isPending={activateMutation.isPending}
          />
        ) : null}
      </div>
    </section>
  )
}

interface SchoolDetailProps {
  id: string
}

export function SchoolDetail({ id }: SchoolDetailProps) {
  const query = useSchoolQuery(id)
  const [isEditing, setIsEditing] = useState(false)

  if (query.isPending) {
    return (
      <Screen title="School Details">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full max-w-lg" />
        </div>
      </Screen>
    )
  }

  if (query.isError) {
    return (
      <Screen title="School Details">
        <ErrorState onRetry={() => { void query.refetch() }} />
      </Screen>
    )
  }

  const school = query.data

  return (
    <Screen title={school.name} description={`${school.slug} – ${school.type}`} actions={<ViewAsTrigger schoolId={id} />}>
      <section className="flex max-w-lg flex-col gap-4 rounded-xl bg-card p-6 shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-foreground">General Info</h2>
          {isEditing ? null : (
            <Button variant="outline" size="sm" onClick={() => { setIsEditing(true) }}>Edit</Button>
          )}
        </div>
        {isEditing ? (
          <SchoolEditForm id={id} school={school} onDone={() => { setIsEditing(false) }} />
        ) : (
          <SchoolInfoDisplay school={school} />
        )}
      </section>
      <Separator />
      <SchoolStatusSection school={school} id={id} />
    </Screen>
  )
}
