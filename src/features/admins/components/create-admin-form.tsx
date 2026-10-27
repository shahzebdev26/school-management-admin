'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Copy } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
import { useCreateAdminMutation } from '../api/use-create-admin-mutation'
import {
  createAdminSchema,
  type CreateAdminFormValues,
} from '../schemas/create-admin-schema'

const KNOWN_FIELDS = ['name', 'email', 'password'] as const

interface Credentials {
  email: string
  password: string
}

function CredentialsDialog({
  credentials,
  onClose,
}: {
  credentials: Credentials
  onClose: () => void
}) {
  const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Admin Created</DialogTitle>
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
            <span className="font-bold">Email:</span> {credentials.email}
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

function useAdminFormSubmit(opts: {
  form: ReturnType<typeof useForm<CreateAdminFormValues>>
  mutation: ReturnType<typeof useCreateAdminMutation>
  setFormError: (msg: string | null) => void
  setCredentials: (creds: Credentials | null) => void
}) {
  const { form, mutation, setFormError, setCredentials } = opts
  const mapServerFieldErrors = useServerFieldErrors(form.setError, KNOWN_FIELDS)

  return form.handleSubmit((values) => {
    setFormError(null)
    mutation.mutate(values, {
      onSuccess: () => {
        setCredentials({ email: form.getValues('email'), password: form.getValues('password') })
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

export function CreateAdminForm() {
  const mutation = useCreateAdminMutation()
  const [formError, setFormError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const form = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { name: '', email: '', password: '' },
  })
  const onSubmit = useAdminFormSubmit({ form, mutation, setFormError, setCredentials })

  return (
    <Screen title="Add Admin" description="Create a new platform administrator">
      {credentials ? (
        <CredentialsDialog credentials={credentials} onClose={() => { setCredentials(null) }} />
      ) : null}
      <form onSubmit={(event) => { void onSubmit(event) }} className="flex max-w-lg flex-col gap-5">
        {formError ? (
          <p role="alert" className="text-sm font-medium text-destructive">{formError}</p>
        ) : null}
        <TextField control={form.control} name="name" label="Full name" required />
        <TextField control={form.control} name="email" label="Email" type="email" autoComplete="email" required />
        <TextField control={form.control} name="password" label="Password" type="password" description="Minimum 10 characters" required />
        <Button type="submit" disabled={mutation.isPending} className="w-fit">
          {mutation.isPending ? 'Creating…' : 'Create admin'}
        </Button>
      </form>
    </Screen>
  )
}
