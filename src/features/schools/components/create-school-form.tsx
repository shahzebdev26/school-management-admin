'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Copy } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { PhoneField } from '@/components/form/phone-field'
import { SelectField } from '@/components/form/select-field'
import { TextField } from '@/components/form/text-field'
import { useServerFieldErrors } from '@/components/form/use-server-field-errors'
import { Screen } from '@/components/shared/screen'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ApiError } from '@/lib/api/errors'
import { useCreateSchoolMutation } from '../api/use-create-school-mutation'
import {
  createSchoolSchema,
  type CreateSchoolFormValues,
  type CreateSchoolInput,
} from '../schemas/create-school-schema'

const KNOWN_FIELDS = ['name', 'slug', 'type', 'contactPerson', 'phone', 'address'] as const

const TYPE_OPTIONS = [
  { value: 'school', label: 'School' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'tuition', label: 'Tuition' },
]

interface Credentials {
  phone: string
  password: string
}

function CredentialsDialog({
  credentials,
  onClose,
}: {
  credentials: Credentials
  onClose: () => void
}) {
  const text = `Phone: ${credentials.phone}\nPassword: ${credentials.password}`

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>School Created</DialogTitle>
          <DialogDescription>
            Save these credentials now. They will not be shown again.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-lg bg-accent p-3">
          <AlertTriangle className="size-5 shrink-0 text-warning" aria-hidden="true" />
          <span className="text-sm font-bold text-foreground">Shown only once</span>
        </div>
        <div className="space-y-2 rounded-lg bg-muted p-4 text-sm font-medium">
          <p>
            <span className="font-bold">Phone:</span> {credentials.phone}
          </p>
          <p>
            <span className="font-bold">Password:</span> {credentials.password}
          </p>
        </div>
        <DialogFooter>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void navigator.clipboard.writeText(text)
              toast.success('Credentials copied')
            }}
          >
            <Copy className="size-4" aria-hidden="true" />
            Copy
          </Button>
          <Button size="sm" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function useSchoolFormSubmit(opts: {
  form: ReturnType<typeof useForm<CreateSchoolFormValues, unknown, CreateSchoolInput>>
  mutation: ReturnType<typeof useCreateSchoolMutation>
  setFormError: (msg: string | null) => void
  setCredentials: (creds: Credentials | null) => void
}) {
  const { form, mutation, setFormError, setCredentials } = opts
  const mapServerFieldErrors = useServerFieldErrors(form.setError, KNOWN_FIELDS)

  return form.handleSubmit((values) => {
    setFormError(null)
    mutation.mutate(values, {
      onSuccess: (result) => {
        setCredentials({
          phone: result.data.adminCredentials.phone,
          password: result.data.adminCredentials.temporaryPassword,
        })
        form.reset()
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          const messages = mapServerFieldErrors(error)
          setFormError(messages[0] ?? error.message)
          return
        }
        setFormError('Something went wrong. Please try again.')
      },
    })
  })
}

export function CreateSchoolForm() {
  const mutation = useCreateSchoolMutation()
  const [formError, setFormError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const form = useForm<CreateSchoolFormValues, unknown, CreateSchoolInput>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: { name: '', slug: '', type: 'school', contactPerson: '', phone: '', address: '' },
  })
  const onSubmit = useSchoolFormSubmit({ form, mutation, setFormError, setCredentials })

  return (
    <Screen title="Add School" description="Register a new school on the platform">
      {credentials ? (
        <CredentialsDialog credentials={credentials} onClose={() => { setCredentials(null) }} />
      ) : null}
      <form onSubmit={(event) => { void onSubmit(event) }} className="flex max-w-lg flex-col gap-5">
        {formError ? (
          <p role="alert" className="text-sm font-medium text-destructive">{formError}</p>
        ) : null}
        <TextField control={form.control} name="name" label="School name" required />
        <TextField control={form.control} name="slug" label="Slug" description="Used as the subdomain, e.g. my-school.techsparks.app" required />
        <SelectField control={form.control} name="type" label="Type" options={TYPE_OPTIONS} required />
        <TextField control={form.control} name="contactPerson" label="Contact person" required />
        <PhoneField control={form.control} name="phone" required />
        <TextField control={form.control} name="address" label="Address" required />
        <Button type="submit" disabled={mutation.isPending} className="w-fit">
          {mutation.isPending ? 'Creating…' : 'Create school'}
        </Button>
      </form>
    </Screen>
  )
}
